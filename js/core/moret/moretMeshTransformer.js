class moretMeshTransformer{
	constructor(moret_reader, mesh_creator, mesh_tools, group_array){
		this.moret_reader = moret_reader;
        this.mesh_creator = mesh_creator;
		this.mesh_tools = mesh_tools;
		this.group_array = group_array;
    }



intersect_etsu(){
	console.log("starting intersecting ETSU");
	for (let line of this.moret_reader.trun_array){
		let id_modu = line[0];
		let id = line[1];
		let truncated_mesh = this.mesh_tools.search_object(id_modu + " " + id, this.group_array);
		if (truncated_mesh == undefined){
			console.log("truncated_mesh undefined");
		}
		let nb_truncater = 	line[2];
		for (let index =  3; index < 3 + nb_truncater; index++){
			let id_truncater_volu = line[index];

			let bsp_mother = this.mesh_creator.search_labeled_bsp(id_modu + " " + id_truncater_volu, false).bsp;
			if (bsp_mother == undefined){
				let truncater_mesh = this.mesh_tools.search_object(id_modu + " " + id_truncater_volu, this.group_array);
				bsp_mother = CSG.fromMesh(truncater_mesh);
			}
			if (bsp_mother != undefined){
				
				let truncater_mesh = this.mesh_tools.search_object(id_modu + " " + id_truncater_volu, this.group_array);
				let vector_truncater = new THREE.Vector3();
				truncater_mesh.getWorldPosition(vector_truncater);				
				let vector_truncated = new THREE.Vector3();
				truncated_mesh.getWorldPosition(vector_truncated);
				vector_truncated.sub(truncated_mesh.position);
				vector_truncater.sub(vector_truncated);

				this.etsu_geometrical_intersect(vector_truncater, bsp_mother, truncated_mesh);

				
				
			} else{				
				console.log("bsp_mother undefined");
			}					
		}
	}
}

print_bsp_vertices(bsp){
	for (let polygon of bsp.polygons){
		console.log(polygon.vertices[0].pos.x, polygon.vertices[0].pos.y, polygon.vertices[0].pos.z);
		//console.log(polygon.vertices[1].pos.x, polygon.vertices[1].pos.y, polygon.vertices[2].pos.z);
		//console.log(polygon.vertices[2].pos.x, polygon.vertices[1].pos.y, polygon.vertices[2].pos.z);
	}
}


intersect_supe(){
	console.log("starting intersecting SUPE");
	for (let supe of this.moret_reader.supe_array){
		let id_modu = supe[0];
		let id = supe[1];

		let bsp_truncater = this.mesh_creator.search_labeled_bsp(id_modu + " " + id, false).bsp;
		if (bsp_truncater == undefined){
			let truncater_mesh = this.mesh_tools.search_object(id_modu + " " + id, this.group_array);
			truncater_mesh.updateMatrix();
			bsp_truncater = CSG.fromMesh(truncater_mesh ); 
		}
		let nb_truncated = 	supe[2];
		for (let index =  3; index < 3 + nb_truncated; index++){
			let id_truncated_volu = supe[index];

			let truncated_mesh = this.mesh_tools.search_object(id_modu + " " + id_truncated_volu, this.group_array);

			if (bsp_truncater != undefined){				
				let truncater_mesh = this.mesh_tools.search_object(id_modu + " " + id, this.group_array);
				let vector_truncater = new THREE.Vector3();
				truncater_mesh.getWorldPosition(vector_truncater);

				let vector_truncated = new THREE.Vector3();
				truncated_mesh.getWorldPosition(vector_truncated);

				vector_truncated.sub(truncated_mesh.position);
				vector_truncater.sub(vector_truncated);

				this.supe_geometrical_substraction(vector_truncater, bsp_truncater, truncated_mesh);	
			}	

		}
	}
}

intersect_inte(){
	console.log("starting intersecting INTE");
	for (let inte of this.moret_reader.inte_array){
		let id_modu = inte[0];
		let id = inte[1];
		let nb_intersected = inte[2];
		let bsp_mother = this.mesh_creator.search_labeled_bsp(id_modu + " " + id, false).bsp;
		if (bsp_mother == undefined){
			let intersector_mesh = this.mesh_tools.search_object(id_modu + " " + id, this.group_array);
			bsp_mother = CSG.fromMesh(intersector_mesh);
		
		}
		if (bsp_mother != undefined){
			for (let index =  3; index < 3 + nb_intersected; index++){
				let id_intersected_volu = inte[index];
				let intersected_mesh = this.mesh_tools.search_object(id_modu + " " + id_intersected_volu, this.group_array);				
				
				let vector_truncater = new THREE.Vector3();
				let intersector_mesh = this.mesh_tools.search_object(id_modu + " " + id, this.group_array);
				intersector_mesh.getWorldPosition(vector_truncater);	

				let vector_truncated = new THREE.Vector3();
				intersected_mesh.getWorldPosition(vector_truncated);

				vector_truncated.sub(intersected_mesh.position);
				vector_truncater.sub(vector_truncated);
				
				this.etsu_geometrical_intersect(vector_truncater, bsp_mother, intersected_mesh);


			}
		} else{				
			console.log("bsp_mother undefined");
		}	
	}
}



supe_geometrical_substraction(vector, bsp_truncater, truncated_mesh){
	console.log("supe_geometrical_substraction used !");
	let bsp_truncated = CSG.fromMesh(truncated_mesh);	
	bsp_truncater.translate(vector.x, vector.y, vector.z);			
	let bsp_result = bsp_truncated.subtract(bsp_truncater);
	bsp_truncater.translate(-vector.x, -vector.y, -vector.z);

	let mesh_result = CSG.toMesh( bsp_result, truncated_mesh.matrix, truncated_mesh.material );				
	truncated_mesh.geometry = mesh_result.geometry;
	truncated_mesh.updateMatrix();
}


etsu_geometrical_intersect(vector, bsp_truncater, truncated_mesh){
	console.log("etsu_geometrical_intersect used !");
	let bsp_truncated = CSG.fromMesh(truncated_mesh );   
	bsp_truncater.translate(vector.x, vector.y, vector.z);
	let bsp_result = bsp_truncated.intersect(bsp_truncater);

	bsp_truncater.translate(-vector.x, -vector.y, -vector.z);
	let mesh_result = CSG.toMesh( bsp_result, truncated_mesh.matrix, truncated_mesh.material );				
	truncated_mesh.geometry = mesh_result.geometry;
	truncated_mesh.updateMatrix();
}

get_position_to_add(mesh){
	let vector_world = new THREE.Vector3();
	mesh.getWorldPosition(vector_world);
	//console.log("world_position", vector_world);
	let vector_relative = mesh.position;
	//console.log("vector_relative", vector_relative);	
	let result = vector_world.sub(vector_relative);
	//console.log("vector_world.sub(vector_relative)", result);
	return result;
}

intersect_parents(){
	console.log("starting intersecting parents");
	for (let volume of this.moret_reader.volu_array){		
		let id_modu = volume.id_modu;
		let id = volume.id;		
		let mesh_son = this.mesh_tools.search_object(id_modu + " " + id, this.group_array);
		let labeled_bsp_son = this.mesh_creator.search_labeled_bsp(id_modu + " " + id, false)
		let bsp_son;
		if (labeled_bsp_son != undefined && mesh_son != undefined){
			bsp_son = labeled_bsp_son.bsp;
			let vector_son = new THREE.Vector3();
			mesh_son.getWorldPosition(vector_son);

			let vector_parent = new THREE.Vector3();
			mesh_son.parent.getWorldPosition(vector_parent);
			vector_parent.sub(mesh_son.parent.position);
			vector_son.sub(vector_parent);
			this.mesh_tools.container_bsp_substraction(vector_son, mesh_son.parent, bsp_son);			
		}

		
	

	}
}






}