class moretMeshTransformer{
	constructor(mesh_creator, mesh_tools){
        this.mesh_creator = mesh_creator;
		this.mesh_tools = mesh_tools;
    }

    
rotate_moret_cells(){ // voir si on veut faire tourner les enfants...
	for (let rotation of moret_reader.rota_array){
		for (let volume of moret_reader.volu_array){
			if (volume[2] == rotation[1] && volume[7] == rotation[0]){ //égalité sur les id_type et les id_modules
			var axis = new THREE.Vector3(1, 0, 0);
			var vector = new THREE.Vector3(1, 0, 0);
			var theta = 0;
			
			if (rotation[4] != 0){ // X rotation
				theta = this.mesh_tools.toRadians(rotation[4]);
				console.log(rotation);
				console.log("theta", theta);
				console.log(Math.sin(theta));
				axis = new THREE.Vector3(0, 1, 0);
				vector = new THREE.Vector3(0, Math.cos(theta), Math.sin(theta));
			} else if (rotation[6] != 0){ //Y
				theta = this.mesh_tools.toRadians(rotation[6]);
				axis = new THREE.Vector3(0, 0, 1);
				vector = new THREE.Vector3(Math.sin(theta), 0, Math.cos(theta));
			} else if (rotation[8] != 0){ //Z
				theta = this.mesh_tools.toRadians(rotation[8]);
				axis = new THREE.Vector3(1, 0, 0);
				vector = new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0);
			} 			
			var quaternion = new THREE.Quaternion(); 
			quaternion.setFromUnitVectors(axis, vector);
			const matrix = new THREE.Matrix4();
			matrix.makeRotationFromQuaternion( quaternion ); //--> transfo qui ne s'applique PAS aux enfants de moret_cell.
			
			let id_modu = volume[7];
			let id_volu = volume[0];
					
			var mesh = this.mesh_tools.search_object(id_modu + " " + id_volu, moret_manager);
			mesh.geometry.applyMatrix4(matrix);
			}
		}
		}		
	
}


intersect_etsu(){
	console.log("starting intersecting ETSU");
	//console.log("moret_reader.trun_array", moret_reader.trun_array);
	//console.log("moret_reader.volu_array", moret_reader.volu_array);
	for (let line of moret_reader.trun_array){
		//console.log("trun_array before substraction", moret_reader.trun_array);
		let id_modu = line[0];
		let id_volu = line[1];
		let truncated_mesh = this.mesh_tools.search_object(id_modu + " " + id_volu, moret_manager);
		//console.log("truncated_mesh",truncated_mesh);
		let nb_truncater = 	line[2];
		for (let index =  3; index < 3 + nb_truncater; index++){
			let id_truncater_volu = line[index];
			let truncater_mesh = this.mesh_tools.search_object(id_modu + " " + id_truncater_volu, moret_manager);
			//console.log("truncater_mesh",truncater_mesh.name);
			//console.log("truncated_mesh :", truncated_mesh.name);
			this.etsu_geometrical_intersect(truncater_mesh, truncated_mesh);			
		}
	}
}


intersect_supe(){
	console.log("starting intersecting SUPE");
	for (let supe of moret_reader.supe_array){
		//console.log("supe_array before substraction", moret_reader.supe_array);
		let id_modu = supe[0];
		let id_volu = supe[1];
		let truncater_mesh = this.mesh_tools.search_object(id_modu + " " + id_volu, moret_manager);
		//console.log("truncater_mesh",truncater_mesh);
		let nb_truncated = 	supe[2];
		for (let index =  3; index < 3 + nb_truncated; index++){
			let id_truncated_volu = supe[index];
			let truncated_mesh = this.mesh_tools.search_object(id_modu + " " + id_truncated_volu, moret_manager);
			//console.log("supe truncated_mesh",truncated_mesh.name);
			//console.log("supe truncater_mesh :", truncater_mesh.name);
			
			this.supe_geometrical_substraction(truncater_mesh, truncated_mesh);		

		}
	}
}

intersect_inte(){
	console.log("starting intersecting INTE");
	for (let inte of moret_reader.inte_array){
		console.log("inte_array before substraction", moret_reader.inte_array);
		let id_modu = inte[0];
		let id_volu = inte[1];
		let intersector_mesh = this.mesh_tools.search_object(id_modu + " " + id_volu, moret_manager);
		let nb_intersected = 	inte[2];
		for (let index =  3; index < 3 + nb_intersected; index++){
			let id_intersected_volu = inte[index];
			let intersected_mesh = this.mesh_tools.search_object(id_modu + " " + id_intersected_volu, moret_manager);
			console.log("inte intersected_mesh",intersected_mesh.name);
			console.log("inte intersector_mesh :", intersector_mesh.name);
			
			//this.inte_geometrical_intersect(intersector_mesh, intersected_mesh);		
			this.etsu_geometrical_intersect(intersector_mesh, intersected_mesh);
		}
	}
}



supe_geometrical_substraction(truncater_mesh, truncated_mesh){
	if (truncated_mesh != undefined && truncater_mesh != undefined && truncated_mesh.geometry != undefined){
		truncater_mesh.updateMatrix();
		truncated_mesh.updateMatrix();		
		let bsp_truncater = CSG.fromMesh(truncater_mesh ); 
		let bsp_truncated = CSG.fromMesh(truncated_mesh);				
		let bsp_truncated_sub = bsp_truncated.subtract(bsp_truncater);
		let mesh_truncated_sub = CSG.toMesh( bsp_truncated_sub, truncated_mesh.matrix, truncated_mesh.material );				
		truncated_mesh.geometry = mesh_truncated_sub.geometry;
	}
}


etsu_geometrical_intersect(container, mesh){
	let vector = new THREE.Vector3();
	vector = this.get_position_to_add(mesh);
	if (container != undefined && mesh != undefined && container.geometry != undefined){
		mesh.translateX(vector.x);
		mesh.translateY(vector.y);
		mesh.translateZ(vector.z);			
		container.updateMatrix();
		mesh.updateMatrix();
		let bsp_mother = CSG.fromMesh(container);
		let bsp_son = CSG.fromMesh(mesh );   
		let bsp_son_sub = bsp_son.intersect(bsp_mother);
		let mesh_son_sub = CSG.toMesh( bsp_son_sub, mesh.matrix, mesh.material );				
		mesh.geometry = mesh_son_sub.geometry;
		mesh.translateX(- vector.x);
		mesh.translateY(- vector.y);
		mesh.translateZ(- vector.z);
	}
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
	for (let volume of moret_reader.volu_array){		
		let id_modu = volume[7];
		let id_volu = volume[0];		
		var mesh_son = this.mesh_tools.search_object(id_modu + " " + id_volu, moret_manager);
		//console.log("mesh intersecting its parent :", mesh_son.name);
		//console.log(mesh_son.parent, mesh_son);
		this.mesh_tools.container_geometrical_substraction(mesh_son.parent, mesh_son);	
	}
}






}