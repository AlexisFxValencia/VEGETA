class moretMeshCreator {
	constructor (moret_reader, mesh_tools, cut_manager, group_array){
		this.group_array = group_array;
		this.moret_reader = moret_reader;
		this.infinity = 1000;
		this.mesh_tools = mesh_tools;
		this.cut_manager = cut_manager;
		this.mesh_array = [];
		this.labeled_bsp_array = [];
	}
	
	create_meshes(){
		console.log("Creating 3D meshes...");
		for (let volume of this.moret_reader.volu_array){
			let type = this.moret_reader.type_array.find(el => el.id === volume.id_type && el.id_modu === volume.id_modu);

			if (type == undefined){
				console.log("type ", volume.id_modu, volume.id_type, "not found !", "It's for the volume : ", volume.id);
			}//console.log(type)
			let color = this.get_color(volume);					
			//let texture = this.mesh_tools.generate_texture();									
			//export manager work with MeshPhongMaterial.
			//no need for texture.
			let material = new THREE.MeshPhongMaterial( {
				color: color,
				//map:texture,
				side: THREE.DoubleSide,
				clippingPlanes: [ this.cut_manager.x_plane, this.cut_manager.y_plane, this.cut_manager.z_plane ],
				clipShadows: true
			} );
			material.name = this.get_material_name(volume);	

			let mesh = this.create_one_mesh(type, material);
			
			mesh.name = volume.id_modu + " " + volume.id;
			this.rotate_mesh(mesh, volume);
			
			this.add_labeled_bsp(mesh, false);

			let [x_obj, y_obj, z_obj] = this.get_volume_relative_position(volume);
			/*
			if (type.shape == "CONX"){
				x_obj -= 0.5*this.infinity/10;
			}if (type.shape == "CONY"){
				y_obj -= 0.5*this.infinity/10;
			}if (type.shape == "CONZ"){
				z_obj -= 0.5*this.infinity/10;
			}
			*/
			
			mesh.position.set(x_obj, y_obj, z_obj);	
			
					

			this.mesh_array.push(mesh);		
			this.add_cell_to_its_container(volume, mesh);
			//console.log("moret mesh :", mesh);
			mesh.updateMatrix();
			

			
		}
	}


	rotate_mesh(mesh, volu){ // voir si on veut faire tourner les enfants...
		if (this.moret_reader.rota_array.length != 0){
			let rota = this.moret_reader.rota_array.find(rota => rota.id_modu === volu.id_modu && rota.id_type === volu.id_type);
			if (rota != undefined){
				this.rotate_one_mesh(mesh, rota);
			} else{				
				//console.log("rota of module : ", volu.id_modu, "type : ", volu.id_type, "is undefined ");
			}
		}		
	}
	
	rotate_one_mesh(mesh, rota){
		let axis = new THREE.Vector3(1, 0, 0);
		let vector = new THREE.Vector3(1, 0, 0);			
		for (let rotation of rota.elementary_rotations){
			let theta = this.mesh_tools.toRadians(rotation.theta);
			if (rotation.type == "X"){
				axis = new THREE.Vector3(0, 1, 0);
				vector = new THREE.Vector3(0, Math.cos(theta), Math.sin(theta));
			} else if (rotation.type == "Y"){
				axis = new THREE.Vector3(0, 0, 1);
				vector = new THREE.Vector3(Math.sin(theta), 0, Math.cos(theta));
			} else if (rotation.type == "Z"){
				axis = new THREE.Vector3(1, 0, 0);
				vector = new THREE.Vector3(Math.cos(theta), Math.sin(theta), 0);
			}
		}
		var quaternion = new THREE.Quaternion(); 
		quaternion.setFromUnitVectors(axis, vector);
		const matrix = new THREE.Matrix4();
		matrix.makeRotationFromQuaternion( quaternion ); //--> transfo qui ne s'applique PAS aux enfants de moret_cell.
		
		mesh.geometry.applyMatrix4(matrix);
	}

	add_labeled_bsp(mesh, is_hole){
		//Adding to the BSP ARRAY
		const labeled_bsp = {
			name: mesh.name,
			bsp: CSG.fromMesh(mesh),
			matrix: mesh.matrix, 
			material: mesh.material,
			is_hole: is_hole,
		};
		this.labeled_bsp_array.push(labeled_bsp);
	}

	search_labeled_bsp(name, is_hole){
		for (let labeled_bsp of this.labeled_bsp_array){
			if (labeled_bsp.name == name && labeled_bsp.is_hole == is_hole){
				return labeled_bsp;
			}
		}
	}

	delete_labeled_bsp(name){
		this.labeled_bsp_array = this.labeled_bsp_array.filter(function(labeled_bsp) {
			return labeled_bsp.name != name;
		  });
	}

	get_material_name(volume){
		if (this.moret_reader.apo_2_array[0] == undefined){
			return volume.id_mate;
		} else {
			//console.log("apo2 material found !");
			let apo_2_line = this.moret_reader.apo_2_array.find(el => el[0] === volume.id_mate);
			let apo_2_name = apo_2_line[1];
			console.log("found APOLLO2 material : ", volume.id_mate + " " + apo_2_name);
			return volume.id_mate + " " + apo_2_name;
		}
		
	}

	create_one_mesh(type, material){
		if (type.shape =="BOX"){
			let dx = type.parameters.dx;
			let dy = type.parameters.dy;
			let dz = type.parameters.dz;
			var geometry = new THREE.BoxGeometry(dx, dy, dz);
			var mesh = new THREE.Mesh( geometry, material );					
		} else if (type.shape =="SPHE"){
			let radius = type.parameters.radius;
			var geometry = new THREE.SphereGeometry(radius, 32, 16 );	
			var mesh = new THREE.Mesh( geometry, material );			
		} else if (type.shape =="CYLX"){
			let radius = type.parameters.radius;
			let height = type.parameters.height;
			var geometry = new THREE.CylinderGeometry(radius, radius, height, 32 );	
			var mesh = new THREE.Mesh( geometry, material );	
			let vector = new THREE.Vector3(1, 0, 0);
			this.mesh_tools.rotate_mesh(mesh, vector);

		} else if (type.shape =="CYLY"){
			let radius = type.parameters.radius;
			let height = type.parameters.height;
			var geometry = new THREE.CylinderGeometry(radius, radius, height, 32 );	
			var mesh = new THREE.Mesh( geometry, material );				
		} else if (type.shape =="CYLZ"){
			let radius = type.parameters.radius;
			let height = type.parameters.height;
			var geometry = new THREE.CylinderGeometry(radius, radius, height, 32 );	
			var mesh = new THREE.Mesh( geometry, material );	
			let vector = new THREE.Vector3(0, 0, 1);
			this.mesh_tools.rotate_mesh(mesh, vector);

		} else if (type.shape =="HEXX" || type.shape =="HEXY" || type.shape =="HEXZ"){
			let side = type.parameters.side;
			let height = type.parameters.height;
			let azimuth = type.parameters.azimuth;
			//console.log(side, height, azimuth);
			var mesh = this.mesh_tools.hexprism_z_mesh_creator(side, height, azimuth );
			if (type.shape =="HEXX"){
				let vector = new THREE.Vector3(1, 0, 0);
				this.mesh_tools.rotate_mesh(mesh, vector);
			} 
			if(type.shape =="HEXY"){
				let vector = new THREE.Vector3(0, 1, 0);
				this.mesh_tools.rotate_mesh(mesh, vector);				
			} 
			
		} else if (type.shape =="ELLI"){
			let a = type.parameters.a;
			let b = type.parameters.b;
			let c = type.parameters.c;
			var mesh = this.mesh_tools.ellipsoid_z_mesh_creator(a, b, c );

		} else if (type.shape =="PLAX" || type.shape =="PLAY" || type.shape =="PLAZ"){
			let dx = this.infinity;
			let dy = this.infinity;
			let dz = this.infinity;
			if (type.parameters.supe_or_inf_or_alt_1 != "SUPE" && type.parameters.supe_or_inf_or_alt_1 != "INFE"){
				let alt_1 = parseFloat(type.parameters.supe_or_inf_or_alt_1);
				let alt_2 = type.parameters.alt_2;
				if (type.shape == "PLAX"){				
					dx = alt_2 - alt_1;
				} else if (type.shape == "PLAY"){				
					dy = alt_2 - alt_1;
				}else if (type.shape == "PLAZ"){				
					dz = alt_2 - alt_1;
				}							
			}
			var geometry = new THREE.BoxGeometry(dx, dy, dz);
			var mesh = new THREE.Mesh( geometry, material);

			
			let vector = new THREE.Vector3(1, 0, 0);
			this.mesh_tools.rotate_mesh(mesh, vector);
			


		} else if (type.shape == "MPLA"){	
			console.log("creating MPLA");
			for (let i=0; i < type.parameters.planes_list.length; i++){
				let plane = type.parameters.planes_list[i];
				let v_a = plane.point_a;
				let v_b = plane.point_b;
				let v_c = plane.point_c;
				let v_ab = v_b.sub(v_a);	
				let v_ac = v_c.sub(v_a);	
				let v_k = v_ab.cross(v_ac);
				let v_norm = v_k.normalize();
				let distance_plane_origin = v_a.dot(v_norm);
				//console.log(distance_plane_origin);
	
				let dx = this.infinity;
				let dy = this.infinity;
				let dz = this.infinity;
				var geometry = new THREE.BoxGeometry(dx, dy, dz);
				var plane_mesh = new THREE.Mesh( geometry, material);
				this.mesh_tools.rotate_mesh(plane_mesh, v_norm);

				plane_mesh.position.set(v_a.x, v_a.y, v_a.z);
				let v_shift = v_norm.multiplyScalar(-dy/2);
				plane_mesh.translateX(v_shift.x);
				plane_mesh.translateY(v_shift.y);
				plane_mesh.translateZ(v_shift.z);

				if (i == 0){
					mesh = plane_mesh;
					
				} else {
					console.log("intersection...");
					mesh.updateMatrix();
					plane_mesh.updateMatrix();
					let bsp_mother = CSG.fromMesh(mesh);
					let bsp_son = CSG.fromMesh(plane_mesh);                        
					let bsp_mother_inte = bsp_mother.intersect(bsp_son);
					let mesh_mother_inte = CSG.toMesh( bsp_mother_inte, mesh.matrix, mesh.material );	
					mesh.geometry = mesh_mother_inte.geometry;
				}
				
			}
			mesh.material.transparent = true;
			mesh.material.opacity = 0;
			mesh.material.needsUpdate = true;	
			//console.log(mesh);
					

		}else if (type.shape =="CYLI"){
			let radius = type.parameters.radius;
			let x_a = type.parameters.x_a;
			let y_a = type.parameters.y_a;
			let z_a = type.parameters.z_a;
			let x_b = type.parameters.x_b;
			let y_b = type.parameters.y_b;
			let z_b = type.parameters.z_b;
			let height = this.infinity;
			var geometry = new THREE.CylinderGeometry(radius, radius, height, 32 );	
			var mesh = new THREE.Mesh( geometry, material );
			let v1 = x_b - x_a;
			let v2 = y_b - y_a;
			let v3 = z_b - z_a;
			let vector = new THREE.Vector3(v1, v2, v3);
			this.mesh_tools.rotate_mesh(mesh, vector);
			mesh.material.transparent = true;
			mesh.material.opacity = 0;
			mesh.material.needsUpdate = true;

		}else if (type.shape =="CONX" || type.shape =="CONY" || type.shape =="CONZ"){
			console.log('creation of cone geometry');
			let geometry;
			if (type.parameters.angle_or_tan == 'TAN'){
				let tan = type.parameters.tan;
				let height = this.infinity/10;
				let radius = height * tan; 
				geometry = new THREE.ConeGeometry( radius, height, 32 );
			} else if (type.parameters.angle_or_tan == 'ANGL'){
				let angle = this.mesh_tools.toRadians(type.parameters.angle);
				let tan = Math.tan(angle);
				let height = this.infinity/10;				
				let radius = height * tan; 
				geometry = new THREE.ConeGeometry( radius, height, 32 );

				/* // PARTIE A TRAVAILLER pour avoir les cones la bonne hauteur directement via sa geometrie.
				if (type.shape =="CONZ"){
					console.log("geometry", geometry);
					//cf . https://dustinpfister.github.io/2021/06/07/threejs-buffer-geometry-attributes-position/
					const position = geometry.getAttribute('position');
					//let n = position.array.length;
					let n = geometry.index.count;
					console.log("my n", n);
					for (let vertIndex = 0; vertIndex < n; vertIndex++){
						let posIndex = geometry.index.array[vertIndex] * 3;
						position.array[posIndex + 2] -= 0.5*height;
					}
					position.needsUpdate = true;						
				}
				*/
				
			}		

			var mesh = new THREE.Mesh( geometry, material);
			

			if (type.shape == "CONX"){
				let vector = new THREE.Vector3(1, 0, 0);
				this.mesh_tools.rotate_mesh(mesh, vector);
			} else if(type.shape == "CONZ"){
				let vector = new THREE.Vector3(0, 0, 1);
				this.mesh_tools.rotate_mesh(mesh, vector);
			}
		}
			
		return mesh;
	}

	position_PLA(){
		for (let type of this.moret_reader.type_array){
			if (type.shape == "PLAX" || type.shape =="PLAY" || type.shape =="PLAZ"){
				for (let volume of this.moret_reader.volu_array){
					if (volume.id_type == type.id && volume.id_modu == type.id_modu){
						let shift = 0.0;
						if (type.parameters.supe_or_inf_or_alt_1 == "SUPE"){
							shift = this.infinity/2 + type.parameters.alt_2;		
						} else if(type.parameters.supe_or_inf_or_alt_1 == "INFE"){
							shift = - this.infinity/2 + type.parameters.alt_2;
						} else{
							let alt_1 = parseFloat(type.parameters.supe_or_inf_or_alt_1);
							let alt_2 = type.parameters.alt_2;
							shift = (alt_1 + alt_2)/2;
							console.log(alt_1, alt_2);
						}
										
						let pla_name = volume.id_modu + " " + volume.id
						var pla_mesh = this.mesh_tools.search_object(pla_name, this.group_array);
						
						if (type.shape == "PLAX"){									
							pla_mesh.position.x += shift; 
						} else if (type.shape == "PLAY"){									
							pla_mesh.position.y += shift; 
						} else if (type.shape == "PLAZ"){									
							pla_mesh.position.z += shift;
							console.log("shift", shift);
						}

						pla_mesh.material.transparent = true;
						pla_mesh.material.opacity = 0;
						pla_mesh.material.needsUpdate = true;
					}
				}
			}
			
		}
	}


	position_MPLA(){
		console.log("positioning MPLA");
		for (let type of this.moret_reader.type_array){
			if (type.shape == "MPLA"){
				for (let volume of this.moret_reader.volu_array){
					if (volume.id_type == type.id && volume.id_modu == type.id_modu){ //égalité sur les id_type et les id_modules
						let id_modu = volume.id_modu
						let id = volume.id;					
						let mpla_mesh = this.mesh_tools.search_object(id_modu + " " + id, this.group_array);
						let vector_I = type.parameters.vector_I;
						let x_I = vector_I.x;
						let y_I = vector_I.y;
						let z_I = vector_I.z;
						let [x_obj, y_obj, z_obj] = this.get_volume_relative_position(volume);
						mpla_mesh.translateX(x_obj - x_I);
						mpla_mesh.translateY(y_obj - y_I);
						mpla_mesh.translateZ(z_obj - z_I);
						console.log(x_I);

						console.log("[x_obj, y_obj, z_obj]", [x_obj, y_obj, z_obj]);
						console.log("vector_I", vector_I);
					}
				}
			}
			
		}
	}


	add_cell_to_its_container(volu, moret_cell){	
		//console.log("adding cell to its container");
		let id_modu = volu.id_modu;
		let id_cont = volu.id_cont;	
		let group = this.group_array.find(group => group.name == id_modu);	
		if (id_cont == 0){ // on ajoute au module en cours
			group.add(moret_cell);
		} else if ( id_cont == id_modu){ 	
			let container_volu = this.moret_reader.volu_array.find(el => el.id_modu === volu.id_modu && el.id === id_cont);
			if (container_volu != undefined){
				let container = group.getObjectByName(id_modu + " " + id_cont);
				container.add(moret_cell);	
			}else{
				group.add(moret_cell);			
			}		
		}else{
			let container = group.getObjectByName(id_modu + " " + id_cont);			
			container.add(moret_cell);
		}
	}

	get_volume_relative_position(volume){
		let id_cont = volume.id_cont;
		if (id_cont == 0){ //correctif pour les id_modules à 0 pour des volumes dans d'autres modules que le n°0 (convention d'écriture).
			id_cont = volume.id_modu;
		}
		if (this.moret_reader.modu_array.includes(id_cont) && id_cont === volume.id_modu){ //si le conteneur est le module
			return [volume.x, volume.y, volume.z];
		} else { // le conteneur est donc un volume
			let container_volu = this.moret_reader.volu_array.find(el => el.id_modu === volume.id_modu && el.id === id_cont);
			if (container_volu == undefined){
				console.log("container_volu is undefined");
			}
			return [volume.x - container_volu.x, volume.y - container_volu.y, volume.z - container_volu.z];
		}	
		

	}

	
	get_color(volume){	
		for (let mate of this.moret_reader.mate_array){
			if (mate.id_mate == volume.id_mate){
				let color = mate.color;
				return color;
			} 
		}
		let id_mate = volume.id_mate;
		let color = this.mesh_tools.attribute_material_color(id_mate);
		let mate = {
			id_mate: id_mate,
			color: color,
		};
		this.moret_reader.mate_array.push(mate);

		return color;
	}


	

}


