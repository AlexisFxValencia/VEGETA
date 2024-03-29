class moretLatticeCreator{
	constructor(moret_reader, mesh_creator, mesh_tools, cut_manager, group_array){
		this.moret_reader = moret_reader;
        this.mesh_creator = mesh_creator;
		this.mesh_tools = mesh_tools;
		this.cut_manager = cut_manager;
		this.group_array = group_array;
    }

	create_lattices_first_module(){
		console.log("creating the lattices of the first module");
		for (let lattice of this.moret_reader.lattice_array){
			if (lattice.id_modu == this.moret_reader.modu_array[0]){
				this.create_one_lattice(lattice);
			}		
		}
	}
		
	create_lattices_secondary_modules(){
		console.log("creating the lattices of other modules");
		for (let lattice of this.moret_reader.lattice_array){
			if (lattice.id_modu != this.moret_reader.modu_array[0]){
				this.create_one_lattice(lattice);
			}		
		}
	}


	create_one_lattice(lattice){		
		let [nx, ny, nz] = [lattice.nx, lattice.ny, lattice.nz];
		let [ix, iy, iz] = [0, 0, 0];
		if (lattice.indp_array != undefined){
			ix = lattice.indp_array[0];
			iy = lattice.indp_array[1];
			iz = lattice.indp_array[2];
			//console.log("indp : ", "ix", ix, "iy", iy, "iz", iz);
		}
		let local_msec_array = this.moret_reader.msec_lattice_array.filter(el => el.id_modu === lattice.id_modu  && el.id_mpri === lattice.id_mpri );		
		let local_dism_array = this.moret_reader.dism_lattice_array.find(el => el.id_modu === lattice.id_modu  && el.id_mpri === lattice.id_mpri );		
		let local_volu_array = this.moret_reader.volu_array.filter(el => el.id_modu === lattice.id_modu);
		
		let volume_mpri = this.moret_reader.volu_array.find(el => el.id === lattice.id_mpri && el.id_modu === lattice.id_modu ); // select volumes that are mpri.
	
		
		let [x_start, x_end, y_start, y_end, z_start, z_end] = this.compute_nx_ny_nz_infinite_lattice(volume_mpri, nx, ny, nz);
		

		for (let x_index = x_start; x_index < x_end; x_index++){
			for (let y_index = y_start; y_index < y_end; y_index++){
				for (let z_index = z_start; z_index < z_end; z_index++){					
					if (local_dism_array != undefined && this.is_dism_cell(local_dism_array.coordinates, x_index + ix, y_index + iy, z_index + iz)){
						console.log(" not creating the dism cell mesh : ", x_index, y_index, z_index);
					} else{							
						let [mpri_cell_to_create, id_msec] = this.check_type_lattice_cell(local_msec_array, x_index + ix, y_index + iy, z_index + iz);						
						let mesh;
						if (mpri_cell_to_create){
							mesh = this.clone_mesh(volume_mpri);
						} else {	
							let volume_msec = local_volu_array.find(el => el.id === id_msec);		
							mesh = this.clone_mesh(volume_msec);	
						}	
						mesh.name = lattice.id_modu + " " + lattice.id_mpri + " " + String(x_index + ix) + " " + String(y_index + iy) + " " + String(z_index + iz);
						
						this.mesh_creator.add_labeled_bsp(mesh, false);

						let type = this.moret_reader.type_array.find(el => el.id == volume_mpri.id_type && el.id_modu == volume_mpri.id_modu);
						let dx = type.parameters.dx;
						let dy = type.parameters.dy;
						let dz = type.parameters.dz;
						let [x_mpri, y_mpri, z_mpri] = this.mesh_creator.get_volume_relative_position(volume_mpri);
						let x_obj = x_mpri + x_index*dx;
						let y_obj = y_mpri + y_index*dy;
						let z_obj = z_mpri + z_index*dz;					
						mesh.position.set(x_obj, y_obj, z_obj);
						mesh.updateMatrix();

						this.mesh_creator.add_cell_to_its_container(volume_mpri, mesh);
						
						this.mesh_creator.mesh_array.push(mesh);						
					}						
				}
			}
		}	
	}

	compute_nx_ny_nz_infinite_lattice(volume_mpri, nx, ny, nz){
		let x_start = 0;
		let x_end = nx;
		let y_start = 0;
		let y_end = ny;
		let z_start = 0;
		let z_end = nz;
		
		if (nx < 0 || ny < 0 || nz < 0){
			let container_volu = this.moret_reader.volu_array.find(el => el.id_modu === volume_mpri.id_modu && el.id === volume_mpri.id_cont);
			let type_mpri = this.moret_reader.type_array.find(el => el.id == volume_mpri.id_type && el.id_modu == volume_mpri.id_modu);
			let type_container = this.moret_reader.type_array.find(el => el.id == container_volu.id_type && el.id_modu == container_volu.id_modu);
			
			
			if (type_container.shape == "BOX"){
				if (nx < 0){
					let Nx = Math.floor(type_container.parameters.dx/type_mpri.parameters.dx)+1;
					x_start = -Nx;
					x_end = Nx;
				}
				if (ny < 0){
					let Ny = Math.floor(type_container.parameters.dy/type_mpri.parameters.dy)+1;
					y_start = -Ny;
					y_end = Ny;
				}
				if (nz < 0){
					let Nz = Math.floor(type_container.parameters.dz/type_mpri.parameters.dz)+1;
					z_start = -Nz;
					z_end = Nz;
				}
			}

			if (type_container.shape == "CYLZ"){
				if (nx < 0){
					let Nx = Math.floor(2*type_container.parameters.radius/type_mpri.parameters.dx)+1;
					x_start = -Nx;
					x_end = Nx;
				}
				if (ny < 0){
					let Ny = Math.floor(2*type_container.parameters.radius/type_mpri.parameters.dy)+1;
					y_start = -Ny;
					y_end = Ny;
				}
				if (nz < 0){
					let Nz = Math.floor(2*type_container.parameters.height/type_mpri.parameters.dz)+1;
					z_start = -Nz;
					z_end = Nz;
				}
			}

			if (type_container.shape == "SPHE"){
				if (nx < 0){
					let Nx = Math.floor(2*type_container.parameters.radius/type_mpri.parameters.dx)+1;
					x_start = -Nx;
					x_end = Nx;
				}
				if (ny < 0){
					let Ny = Math.floor(2*type_container.parameters.radius/type_mpri.parameters.dy)+1;
					y_start = -Ny;
					y_end = Ny;
				}
				if (nz < 0){
					let Nz = Math.floor(2*type_container.parameters.radius/type_mpri.parameters.dz)+1;
					z_start = -Nz;
					z_end = Nz;
				}
			}
			
		}
		//console.log("[x_start, x_end, y_start, y_end, z_start, z_end] : ", [x_start, x_end, y_start, y_end, z_start, z_end]);
		return [x_start, x_end, y_start, y_end, z_start, z_end];
		
	}

	is_dism_cell(dism_coordinates, x_index, y_index, z_index){
		for (let coordinate of dism_coordinates){		
			if (x_index == coordinate[0] &&  y_index == coordinate[1] && z_index == coordinate[2]){
				return true;
			}
		}
		return false;
	}

	check_type_lattice_cell(local_msec_array, x_index, y_index, z_index){
		for (let msec of local_msec_array){
			for (let coordinate of msec.coordinates){		
				if (x_index == coordinate[0] &&  y_index == coordinate[1] && z_index == coordinate[2]){
					return [false, msec.id_msec];
				}
			}
		}
		return [true, -1];
	}
	


	create_lattices_first_module_hex(){
		console.log("create hexagonal lattices of the first module");
		for (let lattice_hex of this.moret_reader.lattice_array_hex){
			if (lattice_hex.id_modu == this.moret_reader.modu_array[0]){
				this.create_one_lattice_hex(lattice_hex);
			}		
		}
	}

	create_lattices_secondary_modules_hex(){
		console.log("create hexagonal lattices of other modules");
		for (let lattice_hex of this.moret_reader.lattice_array_hex){
			if (lattice_hex.id_modu != this.moret_reader.modu_array[0]){
				this.create_one_lattice_hex(lattice_hex);
			}		
		}
	}


	create_one_lattice_hex(lattice){
		console.log("create one hexagonal lattice");
		console.log(lattice);
		let id_modu = lattice.id_modu;
		let id_mpri = lattice.id_mpri;
		let nr = lattice.nr;
		let nz = lattice.nz;
		
		let local_volu_array = this.moret_reader.volu_array.filter(el => el.id_modu === id_modu);
		let local_msec_array = this.moret_reader.msec_lattice_array.filter(el => el.id_modu === id_modu && el.id_mpri === id_mpri);		
		let volume_mpri = local_volu_array.find(el => el.id === id_mpri);
		let local_type_array = this.moret_reader.type_array.filter(el => el.id_modu === id_modu);
		console.log("local_type_array", local_type_array);
		let hexagone = local_type_array.find(el => el.id === volume_mpri.id_type);
		let side = hexagone.parameters.side;
		let h = Math.cos(Math.PI/6) * side;
		let height = hexagone.parameters.height;

		let [x_obj, y_obj, z_obj] = this.mesh_creator.get_volume_relative_position(volume_mpri);
		
		let origin_z = z_obj;
		let position_z = 0;

		let [ix, iy, iz] = [0, 0, 0];
		if (lattice.indp_array != undefined){
			ix = lattice.indp_array[0];
			iy = lattice.indp_array[1];
			iz = lattice.indp_array[2];
			console.log("indp_array : ", "ix", ix, "iy", iy, "iz", iz);
		}
		
		console.log("nz : ", nz);
		for (let z = 0; z < nz; z++){
			position_z = origin_z + height * z;
			let origin_x = x_obj;
			let origin_y = y_obj;	
			origin_y -= (nr-1) * 2 * h;
			let origin_bis_x = x_obj;
			let origin_bis_y = y_obj;
			origin_bis_y += (nr-1) * 2 * h;
			let position_x = 0;
			let position_y = 0;	
			let position_bis_x = 0;
			let position_bis_y = 0;
			
			for (let y = 1; y < nr; y++){
				let nx = nr + y - 1;
				for (let x = 0; x < nx; x++){
					position_x = origin_x + x * 1.5 * side;
					position_y = origin_y + x * h;	
					this.create_one_pattern_hex(position_x, position_y, position_z, volume_mpri, hexagone, local_msec_array, local_volu_array, ix, iy, iz);
					
					position_bis_x = origin_bis_x - x * 1.5 * side;
					position_bis_y = origin_bis_y - x * h;
					this.create_one_pattern_hex(position_bis_x, position_bis_y, position_z, volume_mpri, hexagone, local_msec_array, local_volu_array, ix, iy, iz);
					
				}
				origin_x += - 1.5 * side;
				origin_y += h;
				origin_bis_x += + 1.5 * side;
				origin_bis_y += - h;
			}
			//central line
			origin_x = x_obj;
			origin_y = y_obj; 
			origin_z = z_obj; 
			origin_bis_x = x_obj;
			origin_bis_y = y_obj;
			//origin_bis_z = z_obj;
			for (let x = 1; x < nr; x++){
				position_x = origin_x + x * 1.5 * side;
				position_y = origin_y + x * h;
				this.create_one_pattern_hex(position_x, position_y, position_z, volume_mpri, hexagone, local_msec_array, local_volu_array, ix, iy, iz);
				
				position_bis_x = origin_bis_x - x * 1.5 * side;
				position_bis_y = origin_bis_y - x * h;
				this.create_one_pattern_hex(position_bis_x, position_bis_y, position_z, volume_mpri, hexagone, local_msec_array, local_volu_array, ix, iy, iz);
				
			}

			//central mesh of other levels.
			if (z != 0){
				this.create_one_pattern_hex(position_x, position_y, position_z, volume_mpri, hexagone, local_msec_array, local_volu_array, ix, iy, iz);
			}			
		}		
	}


	find_hex_index(x, y, z, x_0, y_0, z_0, hexagone){
		let hex_vector = new THREE.Vector3(x - x_0, y - y_0, z - z_0);
		let side = hexagone.parameters.side;		
		let vector_x;
		let vector_y;
		let vector_z;
		if (hexagone.shape == "HEXX"){
			vector_x = new THREE.Vector3(0, 1, 0);
			vector_y = new THREE.Vector3(0, 0, -1);
			vector_z = new THREE.Vector3(1, 0, 0);
		} else if (hexagone.shape == "HEXY"){
			vector_x = new THREE.Vector3(0, 0, -1);
			vector_y = new THREE.Vector3(1, 0, 0);
			vector_z = new THREE.Vector3(0, 1, 0);
		} else if (hexagone.shape == "HEXZ"){
			vector_x = new THREE.Vector3(1, 0, 0);
			vector_y = new THREE.Vector3(0, 1, 0);
			vector_z = new THREE.Vector3(0, 0, 1);
		}
		let angle_1 = Math.PI / 6;
		let angle_2 = Math.PI / 3;
		let distance_2_center = 2 * side * Math.cos(angle_1);
		vector_x.applyAxisAngle( vector_z, angle_1 );
		vector_y.applyAxisAngle( vector_z, angle_2 );
		vector_x.multiplyScalar(distance_2_center);
		vector_y.multiplyScalar(distance_2_center);

		let array = [vector_x.x, vector_y.x, 
					vector_x.y, vector_y.y];

		let inverted_array = this.inverse(array);
		let index_vector = this.matrix_2_multiplication(inverted_array, hex_vector);

		let x_index = parseInt(Math.round(index_vector.x, 1), 10) ;
		let y_index = parseInt(Math.round(index_vector.y, 1), 10) ;		

		//console.log("x_index, y_index", x_index, y_index);
		return [x_index, y_index, 0];


	}


	inverse(array){
		let a = array[0];
		let b = array[1];
		let c = array[2];
		let d = array[3];
		let det = a * d - b * c;
		let temp_array = [];
		temp_array.push(d/det);
		temp_array.push(-b/det);
		temp_array.push(-c/det);
		temp_array.push(a/det);
		return temp_array;
	}

	matrix_2_multiplication(array, vector){
		let a = array[0];
		let b = array[1];
		let c = array[2];
		let d = array[3];
		let vector_2 = new THREE.Vector3(a*vector.x + b*vector.y, c*vector.x + d*vector.y, 0);
		return vector_2;
	}

	create_one_pattern_hex(position_x, position_y, position_z, volume_mpri, hexagone, local_msec_array, local_volu_array, ix, iy, iz){
		//console.log("create_one_pattern_hex");
		let [x_index, y_index, z_index] = this.find_hex_index(position_x, position_y, position_z, 0, 0, 0, hexagone);
		let [mpri_cell_to_create, id_msec] = this.check_type_lattice_cell(local_msec_array, x_index+ix, y_index+iy, z_index+iz);
		let mesh;
		if (mpri_cell_to_create){
			mesh = this.clone_hex_mesh(volume_mpri, position_x, position_y, position_z);
		} else {	
			let volume_msec = local_volu_array.find(el => el.id === id_msec);		
			mesh = this.clone_hex_mesh(volume_msec, position_x, position_y, position_z);	
		}
		mesh.name = volume_mpri.id_modu + " " + volume_mpri.id + " " + String(x_index + ix) + " " + String(y_index + iy) + " " + String(z_index + iz);
		this.mesh_creator.add_cell_to_its_container(volume_mpri, mesh);
		this.mesh_creator.mesh_array.push(mesh);
	}


	clone_mesh(volume){
		let model_mesh = this.mesh_tools.search_object(volume.id_modu + " " + volume.id, this.group_array);
		let mesh = model_mesh.clone(true);
		mesh.material = model_mesh.material.clone();			
		mesh.material.clippingPlanes = [ this.cut_manager.x_plane, this.cut_manager.y_plane, this.cut_manager.z_plane ];
		return mesh;
	}

	clone_hex_mesh(volume_mpri, x, y, z){
		let id_modu = volume_mpri.id_modu;
		let id_mpri = volume_mpri.id; 
		let model_volume = this.mesh_tools.search_object(id_modu + " " + id_mpri, this.group_array);
		
		let cloned_mesh = model_volume.clone(true);
		cloned_mesh.material = model_volume.material.clone();	
		cloned_mesh.material.clippingPlanes = [ this.cut_manager.x_plane, this.cut_manager.y_plane, this.cut_manager.z_plane ];
		cloned_mesh.position.set(x, y, z);

		return cloned_mesh;		
	}

	
	remove_first_mpri_cell_first_module(){
		console.log("remove first mpri cell of the first module");
		for (let volume of this.moret_reader.volu_array){
			if (volume.id_modu == this.moret_reader.modu_array[0]){ //test for the name of the module
				if (this.is_mpri(volume) == true){
					console.log("remove mpri");
					this.remove_mesh(volume);
				}
			}		
		}
	}

	remove_first_mpri_cell_secondary_modules(){
		console.log("remove first mpri cell of the other modules");
		for (let volume of this.moret_reader.volu_array){
			if (volume.id_modu != this.moret_reader.modu_array[0]){
				if (this.is_mpri(volume) == true){
					console.log("remove mpri");
					this.remove_mesh(volume);
				}
			}		
		}
	}

	remove_mesh(volume){		
		let mesh = this.mesh_tools.search_object(volume.id_modu + " " + volume.id, this.group_array);
		if (mesh != undefined){
			mesh.removeFromParent();	
		}					
	}

	is_mpri(volume){
		for (let lattice of this.moret_reader.lattice_array){ 
			if(volume.id_modu == lattice.id_modu && volume.id == lattice.id_mpri){
				return true;
			}
		}
		return false;
	}

	remove_first_msec_cell_first_module(){
		console.log("remove first msec cell of the first module");
		for (let volume of this.moret_reader.volu_array){
			if (volume.id_modu == this.moret_reader.modu_array[0]){
				if (this.is_msec(volume) == true){
					this.remove_mesh(volume);
				}
			}		
		}
	}

	remove_first_msec_cell_secondary_modules(){
		console.log("remove first msec cell of the first module");
		for (let volume of this.moret_reader.volu_array){
			if (volume.id_modu != this.moret_reader.modu_array[0]){
				if (this.is_msec(volume) == true){
					this.remove_mesh(volume);
				}
			}		
		}
	}


	is_msec(volume){
		for (let msec of this.moret_reader.msec_lattice_array){ 
			if(volume.id_modu == msec.id_modu && volume.id == msec.id_msec){
				return true;
			}
		}
		return false;
	}

}