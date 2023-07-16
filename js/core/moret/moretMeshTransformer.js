class moretMeshTransformer{
	constructor(moret_reader, mesh_creator, lattice_creator, mesh_tools, group_array){
		this.moret_reader = moret_reader;
        this.mesh_creator = mesh_creator;
		this.lattice_creator = lattice_creator;
		this.mesh_tools = mesh_tools;
		this.group_array = group_array;
		this.labeled_bsp_array = []; 
    }



intersect_etsu(){
	console.log("starting intersecting ETSU");
	for (let trun of this.moret_reader.trun_array){
		let truncated_mesh = this.mesh_tools.search_object(trun.id_modu + " " + trun.id, this.group_array);
		if (truncated_mesh == undefined){
			console.log("truncated_mesh undefined");
		}		
		for (let id_truncater of trun.truncater_objects){
			let truncater_name = trun.id_modu + " " + id_truncater;
			if (trun.for_hole){
				truncater_name += " hole";
			}
			let bsp_truncater = this.mesh_creator.search_labeled_bsp(truncater_name, trun.for_hole).bsp;
			if (bsp_truncater == undefined){
				let truncater_mesh = this.mesh_tools.search_object(truncater_name, this.group_array);
				bsp_truncater = CSG.fromMesh(truncater_mesh);
			}

			let truncater_mesh = this.mesh_tools.search_object(truncater_name, this.group_array);
			let vector_truncater = new THREE.Vector3();
			truncater_mesh.getWorldPosition(vector_truncater);				
			let vector_truncated = new THREE.Vector3();
			truncated_mesh.getWorldPosition(vector_truncated);
			vector_truncated.sub(truncated_mesh.position);
			vector_truncater.sub(vector_truncated);
			
			let labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === truncated_mesh.name)
			if (labeled_bsp_mother == undefined){
				this.add_labeled_bsp(truncated_mesh);
				labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === truncated_mesh.name);
			}								
			this.bsp_intersection(vector_truncater, labeled_bsp_mother, bsp_truncater);							
		}
	}
}


intersect_supe(){
	console.log("starting intersecting SUPE");
	for (let supe of this.moret_reader.supe_array){
		let truncater_name = supe.id_modu + " " + supe.id;
		if (supe.for_hole){
			truncater_name += " hole";
		} 				
		let bsp_truncater = this.mesh_creator.search_labeled_bsp(truncater_name, supe.for_hole).bsp;
		if (bsp_truncater == undefined){
			let truncater_mesh = this.mesh_tools.search_object(truncater_name, this.group_array);
			truncater_mesh.updateMatrix();
			bsp_truncater = CSG.fromMesh(truncater_mesh ); 
		}
		let nb_truncated = 	supe.nb_truncated;
		for (let i = 0; i < nb_truncated; i++){
			let id_truncated = supe.truncated_objects[i];
			let truncated_name = supe.id_modu + " " + id_truncated;
			let truncated_mesh = this.mesh_tools.search_object(truncated_name, this.group_array);

			if (bsp_truncater != undefined){				
				let truncater_mesh = this.mesh_tools.search_object(truncater_name, this.group_array);
				let vector_truncater = new THREE.Vector3();
				truncater_mesh.getWorldPosition(vector_truncater);

				let vector_truncated = new THREE.Vector3();
				truncated_mesh.getWorldPosition(vector_truncated);

				vector_truncated.sub(truncated_mesh.position);
				vector_truncater.sub(vector_truncated);		

				let labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === truncated_mesh.name)
				if (labeled_bsp_mother == undefined){
					this.add_labeled_bsp(truncated_mesh);
					labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === truncated_mesh.name);
				}								
				this.bsp_substraction(vector_truncater, labeled_bsp_mother, bsp_truncater);
				
			}	

		}
	}
}

intersect_inte(){
	console.log("starting intersecting INTE");
	for (let inte of this.moret_reader.inte_array){
		let id_modu = inte.id_modu;
		let id = inte.id;
		let nb_intersected = inte.nb_intersected;
		let intersector_name = id_modu + " " + id;
		if (inte.for_hole){
			intersector_name += " hole";
		}

		let bsp_intersector = this.mesh_creator.search_labeled_bsp(intersector_name, inte.for_hole).bsp;
		if (bsp_intersector == undefined){
			let intersector_mesh = this.mesh_tools.search_object(intersector_name, this.group_array);
			bsp_intersector = CSG.fromMesh(intersector_mesh);
		
		}
		for (let i =  0; i < nb_intersected; i++){
			let id_intersected = inte.intersected_objects[i];
			let intersected_mesh = this.mesh_tools.search_object(id_modu + " " + id_intersected, this.group_array);				
			
			let vector_truncater = new THREE.Vector3();
			let intersector_mesh = this.mesh_tools.search_object(id_modu + " " + id, this.group_array);
			intersector_mesh.getWorldPosition(vector_truncater);	

			let vector_truncated = new THREE.Vector3();
			intersected_mesh.getWorldPosition(vector_truncated);

			vector_truncated.sub(intersected_mesh.position);
			vector_truncater.sub(vector_truncated);
			
			let labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === intersected_mesh.name)
			if (labeled_bsp_mother == undefined){
				this.add_labeled_bsp(intersected_mesh);
				labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === intersected_mesh.name);
			}								
			this.bsp_intersection(vector_truncater, labeled_bsp_mother, bsp_intersector);							


		}
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
	for (let volume of this.moret_reader.volu_array){		
		let name = volume.id_modu + " " + volume.id;
		//let group = this.group_array.find(group => group.name = volume.id_modu);
		//let mesh_son = group.getObjectByName(name);
		let mesh_son = this.mesh_tools.search_object(name, this.group_array);
		let labeled_bsp_son = this.mesh_creator.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === name && labeled_bsp.is_hole === false)
		if (labeled_bsp_son != undefined && mesh_son != undefined){
			let vector_son = new THREE.Vector3();
			mesh_son.getWorldPosition(vector_son);
			let vector_parent = new THREE.Vector3();
			mesh_son.parent.getWorldPosition(vector_parent);
			vector_parent.sub(mesh_son.parent.position);
			vector_son.sub(vector_parent);

			if (mesh_son.parent != undefined && mesh_son.parent.geometry != undefined){		
				let labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === mesh_son.parent.name)
				if (labeled_bsp_mother == undefined){
					this.add_labeled_bsp(mesh_son.parent);
					labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === mesh_son.parent.name);
				}								
				this.bsp_substraction(vector_son, labeled_bsp_mother, labeled_bsp_son.bsp);
			}	
		}	
			
	}
}

bsp_substraction(vector, labeled_bsp_mother, bsp_son){	
	bsp_son.translate(vector.x, vector.y, vector.z);
	labeled_bsp_mother.bsp = labeled_bsp_mother.bsp.subtract(bsp_son);
	bsp_son.translate(-vector.x, -vector.y, -vector.z);
}

bsp_intersection(vector, labeled_bsp_mother, bsp_son){
	bsp_son.translate(vector.x, vector.y, vector.z);
	labeled_bsp_mother.bsp = labeled_bsp_mother.bsp.intersect(bsp_son);
	bsp_son.translate(-vector.x, -vector.y, -vector.z);
}

add_labeled_bsp(mesh){
	let labeled_bsp = {
		name: mesh.name,
		bsp: CSG.fromMesh(mesh),
		matrix: mesh.matrix, 
		material: mesh.material,
		is_hole: false,
	};
	this.labeled_bsp_array.push(labeled_bsp);
}


update_geometries(){
	console.log("updating geometries after CSG");
	for (let labeled_bsp of this.labeled_bsp_array){
		let mesh = this.mesh_tools.search_object(labeled_bsp.name, this.group_array);
		let processed_mesh = CSG.toMesh(labeled_bsp.bsp, labeled_bsp.matrix, labeled_bsp.material);
		mesh.geometry = processed_mesh.geometry;
		mesh.updateMatrix();
	}

}



subtract_lattice_meshes_first_module(){
	for (let lattice of this.moret_reader.lattice_array){
		if (lattice.id_modu == this.moret_reader.modu_array[0]){
			this.subtract_lattice_mesh(lattice);
		}
	}				
}

subtract_lattice_meshes_secondary_modules(){
	for (let lattice of this.moret_reader.lattice_array){
		if (lattice.id_modu != this.moret_reader.modu_array[0]){
			this.subtract_lattice_mesh(lattice);
		}
	}			
}

subtract_lattice_mesh(lattice){	
	let mpri_name = lattice.id_modu + " " + lattice.id_mpri;
	let volume_mpri = this.moret_reader.volu_array.find(el => el.id_modu === lattice.id_modu && el.id === lattice.id_mpri);
	let type = this.moret_reader.type_array.find(el => el.id === volume_mpri.id_type && el.id_modu === volume_mpri.id_modu);
	let dx = type.parameters.dx;
	let dy = type.parameters.dy;
	let dz = type.parameters.dz;
	let box_geometry = new THREE.BoxGeometry(dx, dy, dz);
	let box_bsp = CSG.fromGeometry(box_geometry);

	let mesh_mpri = this.mesh_tools.search_object(mpri_name, this.group_array);
	let mesh_parent = mesh_mpri.parent;

	if (mesh_parent.geometry == undefined){ // if mesh_parent is not a mesh but a group
		return;
	}

	let labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === mesh_parent.name)

	let [nx, ny, nz] = [lattice.nx, lattice.ny, lattice.nz];
	let [ix, iy, iz] = [0, 0, 0];
	if (lattice.indp_array != undefined){
		ix = lattice.indp_array[0];
		iy = lattice.indp_array[1];
		iz = lattice.indp_array[2];
	}

	for (let x_index = 0; x_index < nx; x_index++){
		for (let y_index = 0; y_index < ny; y_index++){
			for (let z_index = 0; z_index < nz; z_index++){				
				let name_son = lattice.id_modu + " " + lattice.id_mpri + " " + String(x_index + ix) + " " + String(y_index + iy) + " " + String(z_index + iz);
				let mesh_son = this.mesh_tools.search_object(name_son, this.group_array);			
				if (mesh_son != undefined){
					let vector_son = new THREE.Vector3();					
					mesh_son.getWorldPosition(vector_son);					
					let vector_parent = new THREE.Vector3();
					mesh_son.parent.getWorldPosition(vector_parent);
					vector_parent.sub(mesh_parent.position);
					vector_son.sub(vector_parent);
					this.bsp_substraction(vector_son, labeled_bsp_mother, box_bsp);						
				}
			}
		}
	}	

	let processed_mesh = CSG.toMesh(labeled_bsp_mother.bsp, labeled_bsp_mother.matrix, labeled_bsp_mother.material);
	mesh_parent.geometry = processed_mesh.geometry;
	mesh_parent.updateMatrix();

}


subtract_lattice_meshes_first_module_hex(){
	for (let lattice of this.moret_reader.lattice_array_hex){
		if (lattice.id_modu == this.moret_reader.modu_array[0]){
			this.subtract_lattice_mesh_lattice_hex(lattice);
		}
	}				
}

subtract_lattice_meshes_secondary_modules_hex(){
	for (let lattice of this.moret_reader.lattice_array_hex){
		if (lattice.id_modu != this.moret_reader.modu_array[0]){
			this.subtract_lattice_mesh_lattice_hex(lattice);
		}
	}			
}

subtract_lattice_mesh_lattice_hex(lattice){	
	console.log("intersect_parents_lattice_hex");
	let mpri_name = lattice.id_modu + " " + lattice.id_mpri;
	let volume_mpri = this.moret_reader.volu_array.find(el => el.id_modu === lattice.id_modu && el.id === lattice.id_mpri);
	let type = this.moret_reader.type_array.find(el => el.id === volume_mpri.id_type && el.id_modu === volume_mpri.id_modu);

	let side = type.parameters.side;
	let height = type.parameters.height;
	let azimuth = type.parameters.azimuth;
	let hexagone_mesh = this.mesh_tools.hexprism_z_mesh_creator(side, height, azimuth );
	if (type.shape =="HEXX"){
		let vector = new THREE.Vector3(1, 0, 0);
		this.mesh_tools.rotate_mesh(mesh, vector);
	} 
	if(type.shape =="HEXY"){
		let vector = new THREE.Vector3(0, 1, 0);
		this.mesh_tools.rotate_mesh(mesh, vector);				
	} 
	let hexagone_bsp = CSG.fromMesh(hexagone_mesh);

	let mesh_mpri = this.mesh_tools.search_object(mpri_name, this.group_array);
	let mesh_parent = mesh_mpri.parent;
	let labeled_bsp_mother = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === mesh_parent.name)

	let [nr, nz] = [lattice.nr, lattice.nz];
	let [ix, iy, iz] = [0, 0, 0];
	if (lattice.indp_array != undefined){
		ix = lattice.indp_array[0];
		iy = lattice.indp_array[1];
		iz = lattice.indp_array[2];
	}

	for (let x_index = -nr; x_index < nr; x_index++){
		for (let y_index = -nr; y_index < nr; y_index++){
			for (let z_index = 0; z_index < nz; z_index++){				
				let name_son = lattice.id_modu + " " + lattice.id_mpri + " " + String(x_index + ix) + " " + String(y_index + iy) + " " + String(z_index + iz);
				let mesh_son = this.mesh_tools.search_object(name_son, this.group_array);			
				if (mesh_son != undefined){
					let vector_son = new THREE.Vector3();					
					mesh_son.getWorldPosition(vector_son);					
					let vector_parent = new THREE.Vector3();
					mesh_son.parent.getWorldPosition(vector_parent);
					vector_parent.sub(mesh_parent.position);
					vector_son.sub(vector_parent);
					this.bsp_substraction(vector_son, labeled_bsp_mother, hexagone_bsp);						
				}
			}
		}
	}	

	let processed_mesh = CSG.toMesh(labeled_bsp_mother.bsp, labeled_bsp_mother.matrix, labeled_bsp_mother.material);
	mesh_parent.geometry = processed_mesh.geometry;
	mesh_parent.updateMatrix();

}


intersect_lattice_with_its_container_first_module(){
	for (let lattice of this.moret_reader.lattice_array){
		if (lattice.id_modu == this.moret_reader.modu_array[0]){
			//if (lattice.nx < 0 || lattice.ny < 0 || lattice.nz < 0){
				this.intersect_lattice_with_its_container(lattice);
			//}
		}
	}	
}

intersect_lattice_with_its_container_secondary_modules(){
	for (let lattice of this.moret_reader.lattice_array){
		if (lattice.id_modu != this.moret_reader.modu_array[0]){
			//if (lattice.nx < 0 || lattice.ny < 0 || lattice.nz < 0){
				this.intersect_lattice_with_its_container(lattice);
			//}
		}
	}	
}

intersect_lattice_with_its_container(lattice){
	console.log("intersect_lattice_with_its_container");
	let mpri_name = lattice.id_modu + " " + lattice.id_mpri;
	let mesh_mpri = this.mesh_tools.search_object(mpri_name, this.group_array);
	let container_mesh = mesh_mpri.parent;
	let container_labeled_bsp = this.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === container_mesh.name)

	let [nx, ny, nz] = [lattice.nx, lattice.ny, lattice.nz];
	let [ix, iy, iz] = [0, 0, 0];
	if (lattice.indp_array != undefined){
		ix = lattice.indp_array[0];
		iy = lattice.indp_array[1];
		iz = lattice.indp_array[2];
	}
	

	for (let x_index = 0; x_index < nx; x_index++){
		for (let y_index = 0; y_index < ny; y_index++){
			for (let z_index = 0; z_index < nz; z_index++){ 
				if (x_index+y_index+z_index != 0){ // Otherwise pb because first maille is subtracted from the container, so there is no intersection between the two.
					let maille_name = lattice.id_modu + " " + lattice.id_mpri + " " + String(x_index + ix) + " " + String(y_index + iy) + " " + String(z_index + iz);
					let maille_mesh = this.mesh_tools.search_object(maille_name, this.group_array);	
					let maille_labeled_bsp = this.mesh_creator.search_labeled_bsp(maille_name, false);

					if (maille_mesh != undefined){		
						let maille_position = new THREE.Vector3(0.0, 0.0 ,0.0);
						maille_mesh.getWorldPosition(maille_position);
						//console.log(x_index, y_index,z_index);
						//console.log(maille_position);
						maille_position.sub(mesh_mpri.position);
						maille_labeled_bsp.bsp.translate(maille_position.x, maille_position.y, maille_position.z);
						maille_labeled_bsp.bsp = maille_labeled_bsp.bsp.intersect(container_labeled_bsp.bsp);
						
						let processed_mesh = CSG.toMesh(maille_labeled_bsp.bsp, maille_labeled_bsp.matrix, maille_labeled_bsp.material);
						maille_mesh.geometry = processed_mesh.geometry;
						maille_mesh.updateMatrix();

						if (maille_labeled_bsp.bsp.polygons.length == 0){
							for (let child of maille_mesh.children){
								child.removeFromParent();
							}
							
						} else{
							
							if (maille_mesh.children != undefined){
								maille_mesh.children[0].traverse( function(child_mesh) {
									//let child_mesh = maille_mesh.children[0];
			
									let child_position = new THREE.Vector3(0.0, 0.0 ,0.0);
									child_mesh.getWorldPosition(child_position);
									console.log(child_mesh.name, " child_position :", child_position);
									
									let child_bsp = CSG.fromMesh(child_mesh)
									child_bsp.translate(child_position.x, child_position.y, child_position.z);
									
									child_bsp = child_bsp.intersect(container_labeled_bsp.bsp);
									//child_bsp.translate(-child_position.x, -child_position.y, -child_position.z);
									
									let processed_child_mesh = CSG.toMesh(child_bsp, child_mesh.matrix, child_mesh.material);
									child_mesh.geometry = processed_child_mesh.geometry;
									
									//console.log(child_mesh.name, " child_mesh.position :", child_mesh.position);
									
									child_mesh.position.set(-child_position.x, -child_position.y, -child_position.z);
									
									/*
									child_mesh.traverse( function(child) {
										child.position.set(child_position.x, child_position.y, child_position.z);
									});
									*/

									child_mesh.updateMatrix();

									
									
									
									
									
								
								})
							}
							
							
						}
					}

					
					
					
				}
			}
		}
	}	

}


}