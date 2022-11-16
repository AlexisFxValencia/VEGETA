class moretMeshCreator {
	constructor (mesh_tools){
		this.infinity = 1000;
		this.mesh_tools = mesh_tools;
	}
	
	create_meshes(){
		console.log("Creating 3D meshes...");
		for (let volume of moret_reader.volu_array){
			let type = moret_reader.type_array.find(el => el[0] == volume[2] && el[5] == volume[7]);
			let color_material = this.get_new_color(volume);					
			//let texture = this.mesh_tools.generate_texture();									
			//export manager work with MeshPhongMaterial.
			//no need for texture.
			let material = new THREE.MeshPhongMaterial( {
				color: color_material,
				//map:texture,
				side: THREE.DoubleSide,
				clippingPlanes: [ x_plane, y_plane, z_plane ],
				clipShadows: true
			} );
			material.name = this.get_material_name(volume);	

											
			let mesh = this.create_one_mesh(type, material);

			let [x_obj, y_obj, z_obj] = this.get_volume_relative_position(volume);
			mesh.position.set(x_obj, y_obj, z_obj);					
			let id_modu = volume[7];
			let id_volu = volume[0];				
			mesh.name = id_modu + " " + id_volu;

			mesh_array.push(mesh);		
			this.add_cell_to_its_container(volume, mesh);
			//console.log("moret mesh created :", mesh.name);
		}
	}

	get_material_name(volume){
		if (moret_reader.apo_2_array[0] == undefined){
			return volume[3];
		} else {
			console.log("apo2 material found !");
			let apo_2_line = moret_reader.apo_2_array.find(el => el[0] === volume[3]);
			let apo_2_name = apo_2_line[1];
			console.log(volume[3] + " " + apo_2_name);
			return volume[3] + " " + apo_2_name;
		}
		
	}

	create_one_mesh(type, material){
		if (type[1] =="BOX"){
			let dx = type[2];
			let dy = type[3];
			let dz = type[4];
			var geometry = new THREE.BoxGeometry(dx, dy, dz);
			var mesh = new THREE.Mesh( geometry, material );					
		} else if (type[1] =="SPHE"){
			let rayon = type[2];
			var geometry = new THREE.SphereGeometry(rayon, 32, 16 );	
			var mesh = new THREE.Mesh( geometry, material );			
		} else if (type[1] =="CYLX"){
			let rayon = type[2];
			let height = type[3];
			var geometry = new THREE.CylinderGeometry(rayon, rayon, height, 32 );	
			var mesh = new THREE.Mesh( geometry, material );	
			let vector = new THREE.Vector3(1, 0, 0);
			this.mesh_tools.rotate_mesh(mesh, vector);

		} else if (type[1] =="CYLY"){
			let rayon = type[2];
			let height = type[3];
			var geometry = new THREE.CylinderGeometry(rayon, rayon, height, 32 );	
			var mesh = new THREE.Mesh( geometry, material );				
		} else if (type[1] =="CYLZ"){
			let rayon = type[2];
			let height = type[3];
			var geometry = new THREE.CylinderGeometry(rayon, rayon, height, 32 );	
			var mesh = new THREE.Mesh( geometry, material );	
			let vector = new THREE.Vector3(0, 0, 1);
			this.mesh_tools.rotate_mesh(mesh, vector);

		} else if (type[1] =="HEXX" || type[1] =="HEXY" || type[1] =="HEXZ"){
			let side = type[2];
			let height = type[3];
			let azimuth = type[4];
			//console.log(side, height, azimuth);
			var mesh = this.mesh_tools.hexprism_z_mesh_creator(side, height, azimuth );
			if (type[1] =="HEXX"){
				let vector = new THREE.Vector3(1, 0, 0);
				this.mesh_tools.rotate_mesh(mesh, vector);
			} 
			if(type[1] =="HEXY"){
				let vector = new THREE.Vector3(0, 1, 0);
				this.mesh_tools.rotate_mesh(mesh, vector);				
			} 
			
		} else if (type[1] =="ELLI"){
			let a = parseFloat(type[2]);
			let b = parseFloat(type[3]);
			let c = parseFloat(type[4]);
			console.log(a, b, c);
			var mesh = this.mesh_tools.ellipsoid_z_mesh_creator(a, b, c );

		} else if (type[1] =="PLAX" || type[1] =="PLAY" || type[1] =="PLAZ"){
			let dx = this.infinity;
			let dy = this.infinity;
			let dz = this.infinity;
			if (type[2] != "SUPE" && type[2] != "INFE"){
				console.log("number!");
				let alt_1 = parseFloat(type[2]);
				let alt_2 = type[3];
				if (type[1] == "PLAX"){				
					dx = alt_2 - alt_1;
				} else if (type[1] == "PLAY"){				
					dy = alt_2 - alt_1;
				}else if (type[1] == "PLAZ"){				
					dz = alt_2 - alt_1;
				}							
			}
			var geometry = new THREE.BoxGeometry(dx, dy, dz);
			var mesh = new THREE.Mesh( geometry, material);

			
			let vector = new THREE.Vector3(1, 0, 0);
			this.mesh_tools.rotate_mesh(mesh, vector);


		} else if (type[1] == "MPLA"){	
			console.log("creating MPLA");			
			for (let i=0; i < type[2].length; i++){
				let mpla_array = type[2][i];
				//console.log(mpla_array);
				let v_a = new THREE.Vector3( mpla_array[0], mpla_array[1], mpla_array[2]);
				let v_b = new THREE.Vector3( mpla_array[3], mpla_array[4], mpla_array[5]);
				let v_c = new THREE.Vector3( mpla_array[6], mpla_array[7], mpla_array[8]);
				//console.log("vectors...");
				//console.log("v_a :", v_a);
				//console.log("v_b :", v_b);
				let v_ab = v_b.sub(v_a);	
				let v_ac = v_c.sub(v_a);			
				//console.log("v_ab :",v_ab);
				//console.log("v_ac :",v_ac);
				let v_k = v_ab.cross(v_ac);
				//console.log(v_k);
				let v_norm = v_k.normalize();
				//console.log(v_norm);
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
			

		}else if (type[1] =="CYLI"){
			let rayon = type[2];
			let x_a = type[3];
			let y_a = type[4];
			let z_a = type[6];
			let x_b = type[7];
			let y_b = type[8];
			let z_b = type[9];
			let height = this.infinity;
			var geometry = new THREE.CylinderGeometry(rayon, rayon, height, 32 );	
			var mesh = new THREE.Mesh( geometry, material );
			let v1 = x_b - x_a;
			let v2 = y_b - y_a;
			let v3 = z_b - z_a;
			let vector = new THREE.Vector3(v1, v2, v3);
			this.mesh_tools.rotate_mesh(mesh, vector);
			mesh.material.transparent = true;
			mesh.material.opacity = 0;
			mesh.material.needsUpdate = true;

		}else if (type[1] =="CONX" || type[1] =="CONY" || type[1] =="CONZ"){
			console.log('creation of cone geometry');
			console.log(type[2]);
			let geometry;
			if (type[2] == 'TAN'){
				let tan = type[3];
				let height = this.infinity/10;
				let radius = height * tan; 
				geometry = new THREE.ConeGeometry( radius, height, 32 );
			} else if (type[2] == 'ANGL'){
				let angle = this.mesh_tools.toRadians(type[3]);
				let tan = Math.tan(angle);
				let height = this.infinity/10;
				let radius = height * tan; 
				geometry = new THREE.ConeGeometry( radius, height, 32 );
			}		

			var mesh = new THREE.Mesh( geometry, material);

			if (type[1] == "CONX"){
				let vector = new THREE.Vector3(1, 0, 0);
				this.mesh_tools.rotate_mesh(mesh, vector);
			} else if(type[1] == "CONZ"){
				let vector = new THREE.Vector3(0, 0, 1);
				this.mesh_tools.rotate_mesh(mesh, vector);
			}
		}
			
		return mesh;
	}

	position_PLA(){
		for (let type of moret_reader.type_array){
			if (type[1] == "PLAX" || type[1] =="PLAY" || type[1] =="PLAZ"){
				for (let volume of moret_reader.volu_array){
					if (volume[2] == type[0] && volume[7] == type[5]){ //égalité sur les id_type et les id_modules
						let shift = 0.0;
						if (type[2] == "SUPE"){
							console.log("coucou2");
							shift = this.infinity/2 + type[3];		
						} else if(type[2] == "INFE"){
							shift = - this.infinity/2 + type[3];
						} else{
							let alt_1 = parseFloat(type[2]);
							let alt_2 = type[3];
							shift = (alt_1 + alt_2)/2;
						}
						let id_modu = volume[7]
						let id_volu = volume[0];					
						var pla_mesh = this.mesh_tools.search_object(id_modu + " " + id_volu, moret_manager);
						//console.log("mesh", mesh);
						
						if (type[1] == "PLAX"){									
							pla_mesh.position.x += shift; 
						} else if (type[1] == "PLAY"){									
							pla_mesh.position.y += shift; 
						} else if (type[1] == "PLAZ"){									
							pla_mesh.position.z += shift; 
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
		for (let type of moret_reader.type_array){
			if (type[1] == "MPLA"){
				for (let volume of moret_reader.volu_array){
					if (volume[2] == type[0] && volume[7] == type[5]){ //égalité sur les id_type et les id_modules
						//let mpla_array = type[2][0];
						//let x_a = mpla_array[0];
						//let y_a = mpla_array[1];
						//let z_a = mpla_array[2];
						let id_modu = volume[7]
						let id_volu = volume[0];					
						let mpla_mesh = this.mesh_tools.search_object(id_modu + " " + id_volu, moret_manager);
						//mpla_mesh.position.set(x_a, y_a, z_a);

						let vector_I = type[3][0];
						let x_I = vector_I[0];
						let y_I = vector_I[1];
						let z_I = vector_I[2];
						//console.log("x_I", x_I);
						//console.log("y_I", y_I);
						//console.log("z_I", z_I);

						let [x_obj, y_obj, z_obj] = this.get_volume_relative_position(volume);
						//console.log("x_obj", x_obj);
						//console.log("y_obj", y_obj);
						//console.log("z_obj", z_obj);

						mpla_mesh.translateX(x_obj - x_I);
						mpla_mesh.translateY(y_obj - y_I);
						mpla_mesh.translateZ(z_obj - z_I);
					}
				}
			}
			
		}
	}


	add_cell_to_its_container(volume, moret_cell){	
		//console.log("adding cell to its container");
		let id_modu = volume[7];
		let id_cont = volume[1];
		let col_id_volu = moret_reader.volu_array.map(function(value,index) { return value[0]; });	
		// partie qui trouve le conteneur de volu_array[i] pour lui rajouter la moret_cell nouvellement créée. 
		
		
		if (id_cont == 0){ // on ajoute au module en cours
			let group_searched = this.mesh_tools.search_object(id_modu, moret_manager);		
			group_searched.add(moret_cell);
			//console.log("group added");
		} else if ( id_cont == id_modu){ //si le conteneur est dans la liste des modules
			//console.log("moret_cell", moret_cell);
			
			let local_volu_array = moret_reader.volu_array.filter(el => el[7] === volume[7]);
			//console.log("local_volu_array",local_volu_array);
			
			let volume_container = local_volu_array.find(el => el[0] === id_cont);
			//console.log("volume_container", volume_container);
			//console.log("volume", volume);
			
			if (volume_container == undefined || Object.is(volume, volume_container)){
				group_searched = this.mesh_tools.search_object(id_modu, moret_manager);
				group_searched.add(moret_cell);
				//console.log("group added");
			}else{
				for (let k = 0; k < moret_manager.group_array.length; k++){
					var container = moret_manager.group_array[k].getObjectByName(id_modu + " " + volume_container[0]);
					if (container != undefined){
						container.add(moret_cell);
						//console.log("volu added 1");
						break;
					} 
				} 
			}
		
			//moret_manager.group_array[id_cont].add(moret_cell); //on ajoute la cellule au groupe associé du module.
		} else if (col_id_volu.includes(id_cont)){ //sinon, c'est que le conteneur est un volume			
			for (let k = 0; k < moret_manager.group_array.length; k++){
				var container = moret_manager.group_array[k].getObjectByName(id_modu + " " + id_cont);
				if (container != undefined){
					container.add(moret_cell);
					//console.log("volu added 2");
					break;
				} 
			}
		}
	}

	get_volume_relative_position(volume){
		let x_obj = volume[4];
		let y_obj = volume[5];
		let z_obj = volume[6];
		let x_cont = 0;
		let y_cont = 0;
		let z_cont = 0;	
		let id_cont = volume[1];
		if (id_cont == 0){ //correctif pour les id_modules à 0 pour des volumes dans d'autres modules que le n°0 (convention d'écriture).
			id_cont = volume[7];
		}
		let id_modu = volume[7];
		let col_id_volu = moret_reader.volu_array.map(function(value,index1) { return value[0]; });
		//console.log("volu_array", moret_reader.volu_array);
		//console.log("col_id_volu", col_id_volu);
		if (moret_reader.modu_array.includes(id_cont) && id_cont == volume[7]){ //on considère qu'un module est à l'origine.
			//console.log("id_cont " + id_cont + " (it is a module)");
			x_cont = 0;
			y_cont = 0;
			z_cont = 0;
				
		} else if (col_id_volu.includes(id_cont)){
			for (let i = 0; i < col_id_volu.length; i++){ 
				if (moret_reader.volu_array[i][0] == id_cont && moret_reader.volu_array[i][7] == id_modu){
					x_cont = moret_reader.volu_array[i][4];
					y_cont = moret_reader.volu_array[i][5];
					z_cont = moret_reader.volu_array[i][6];
				}
			}	
		}	
		//console.log(volume[0] + " [x_obj, y_obj, z_obj] "+[x_obj, y_obj, z_obj]);
		//console.log(volume[0] + " [x_cont, y_cont, z_cont] "+[x_cont, y_cont, z_cont]);
		//console.log(volume[0] + " [x_obj - x_cont, y_obj - y_cont, z_obj - z_cont] "+[x_obj - x_cont, y_obj - y_cont, z_obj - z_cont]);
		return [x_obj - x_cont, y_obj - y_cont, z_obj - z_cont];
	}

	
	get_new_color(volume){	
		for (let mate of moret_reader.mate_array){
			if (mate[0] == volume[3]){ //mate[0] = id_mate of material, volume[3] = id_mate of the volume)
				let color_material = mate[1];
				//console.log("color of volume found", volume[0], mate[0]);
				return color_material;
			} 
		}
		//let color_material = this.mesh_tools.getRandomColor();

		let id_mate = volume[3];
		let color_material = this.mesh_tools.attribute_material_color(id_mate);
		moret_reader.mate_array.push([id_mate, color_material]);

		return color_material;
	}

}


