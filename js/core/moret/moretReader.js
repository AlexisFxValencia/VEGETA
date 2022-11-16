
class moretReader{
	constructor(mesh_tools){
        this.mesh_tools = mesh_tools;
		this.modu_array = [];
		this.type_array = [];
		this.volu_array = [];
		this.mate_array = [];	
		this.apo_2_array = [];	
		this.lattice_array = [];
		this.lattice_array_hex = [];
		this.msec_lattice_array = [];	
		this.dism_lattice_array = [];
		this.hole_array = [];	
		this.trun_array = [];
		this.supe_array = [];
		this.inte_array = [];
		this.rota_array = [];
	}

	clear_arrays(){
		this.modu_array = [];
		this.type_array = [];
		this.volu_array = [];
		this.mate_array = [];
		this.apo_2_array = [];	
		this.lattice_array = [];		
		this.lattice_array_hex = [];	
		this.msec_lattice_array = [];		
		this.dism_lattice_array = [];
		this.hole_array = [];	
		this.trun_array = [];
		this.supe_array = [];
		this.inte_array = [];
		this.rota_array = [];
	}

	parsing(text) {		
		//console.log(text);
		text = text.split('DEBUT_MORET').pop().split('FIN_MORET')[0];	
		text = text.split('MORET_BEGIN').pop().split('MORET_END')[0];	
		//console.log(text);

		this.apo_2_reading(text);

		text = text.replace(/\*/gm, '\n\*');
		text = text.replace(/^\*.*$/gm, '');

		text = text.replace(/:/g, " "); // épuration des .listing parfois qui ont des ":"
		text = text.replace(/\t/g, " ");
		text = text.replace(/VOLU/g, "\nVOLU"); // épuration des JDD auxquels ils manque des sauts de ligne.
		text = text.replace(/TROU/g, "\nTROU"); // épuration des JDD auxquels ils manque des sauts de ligne.
		text = text.replace(/\s+SUPE/g, ' SUPE'); // évite des SUPE seuls sur leur ligne (les rattache au volume précédent)
		text = text.replace(/\s+ECRA/g, ' ECRA'); // évite des ECRA seuls sur leur ligne (les rattache au volume précédent)		
		text = text.replace(/\s+INTE/g, ' INTE'); // évite des INTE seuls sur leur ligne (les rattache au volume précédent)
		

		text = text.replace(/DIMR/g, "\nDIMR"); // épuration des JDD auxquels ils manque des sauts de ligne.
		

		text = text.replace(/VOLUME/g, 'VOLU'); // évite des SUPE seuls sur leur ligne (les rattache au volume précédent)
		text = text.replace(/SPHERE/g, 'SPHE');
		text = text.replace(/\n+/gm, '\n');
		//console.log(text);

		text = this.translate_moret_4_to_moret_5(text);
		//console.log(text);

		//lecture de la partie matériaux.
		let text2 = text.split('CHIM').pop().split('FINCHIM')[0];	
		text2 = text2.split('MATE').pop().split('ENDM')[0];
		//console.log("text2", text2);
		let lines = text2.split('\n');
		for(let line of lines){		
			this.mate_reading(line);
		}
		//console.log("this.mate_array", this.mate_array) ;
		
		//isolement de la partie géométrique puis lecture. 
		text = text.replace("FINGEOM", "ENDG");
		text = text.split('GEOM').pop().split('FING')[0];	
		text = text.split('ENDG')[0];	
		this.modu_reading(text);
	}

	parsing_xml(text_xml){
		console.log("XML parsing...");
		//console.log("text_xml", text_xml);
		var parser = new DOMParser();
		var xmlDoc = parser.parseFromString(text_xml,"text/xml");
		//console.log(xmlDoc);
		console.log(xmlDoc.getElementsByTagName("g3d"));
	}

	apo_2_reading(text){
		let text2 = text.split('CHIM').pop().split('FINC')[0];	
		let lines = text2.split('\n');
		//console.log("text2", text2);
		for(let i = 0; i < lines.length; i++){	
			lines[i] = lines[i].trim();	
			let line_array = lines[i].split(/\s+/);			
			if (line_array[0] == "APO2"){	
				let mate_id = line_array[1];
				let previous_line_array = lines[i-1].split(/\s+/);
				let mate_name = previous_line_array[1];
				this.apo_2_array.push([mate_id, mate_name]);
			}
		}

		console.log("apo_2_array", this.apo_2_array);
	}


	translate_moret_4_to_moret_5(text){
		let lines = text.split('\n');
		for(let i = 0; i < lines.length ; i++){
			if (lines[i].includes("RESEAU")){
				//ex : RESEAU 3 13 13 8
				let line_array = lines[i].trim().split(/\s+/);
				let temp_array = [];
				temp_array.push("RESC");
				temp_array.push("MPRI " + line_array[1]);
				temp_array.push("DIMR " + line_array[2] + " " + line_array[3] + " " + line_array[4] + " ");
				temp_array.push("FINR");
				console.log("temp_array", temp_array);
				let lattice_text = temp_array.join("\n");
				console.log("temp_array", lattice_text);
				lines[i] = lattice_text;
				text = lines.join("\n");
			}
			
		}
		return text;

	}

	modu_reading(text){
		var text_modu_array = text.split("MODU");
		//correctif au cas où on met un JDD partiel sans nom de module, le module standard est 0
		if (text_modu_array.length < 2){
			var new_text_modu_array = ['MODU 0'].concat(text_modu_array);
			text = new_text_modu_array.join(" ");
			text_modu_array = text.split("MODU");
		}

		text_modu_array.shift();
		for(let j = 0; j < text_modu_array.length ; j++){
			//let module_name = text_modu_array[j].trim().charAt(0); // attention ne marchera pas si plus de 9 modules.
			console.log("mon module splité : ", text_modu_array[j].trim().split(" ")[0]);
			let module_name = text_modu_array[j].trim();
			module_name = module_name.replace(/\n+/gm, ' ');
			module_name = module_name.split(" ")[0]; //fonctionne avec un nombre quelconque de modules
			
			this.modu_array.push(module_name);

			this.lattice_reading(text_modu_array[j], module_name);
			this.lattice_reading_hex(text_modu_array[j], module_name);
			this.mpla_reading(text_modu_array[j], module_name);
			
			let lines = text_modu_array[j].split('\n');
			for(let i = 0; i < lines.length ; i++){
				this.volu_reading(lines[i], module_name);
				this.hole_reading(lines[i], module_name); 
				this.type_reading(lines[i], module_name); 
			}
			//console.log("hole_array", hole_array);
			//console.log("type_array", this.type_array);
			//console.log("this.volu_array", this.volu_array);
		}
		
		this.check_volu_order();
		//console.log("moret_reader.volu_array", moret_reader.volu_array);
	}

	check_volu_order(){
		console.log("checking volumes order");
		for (let nb_iteration = 0; nb_iteration < 3; nb_iteration++){
			for (let i = 0; i < this.volu_array.length -1 ; i++){
				for (let j = i+1; j <  this.volu_array.length ; j++){
					if (this.volu_array[i][1] == this.volu_array[j][0] && this.volu_array[i][7] == this.volu_array[j][7] ){
						//console.log("i and j : ", i, " ", j);
						console.log("swap :", this.volu_array[i][0], " and ", this.volu_array[j][0]);
						this.swap_elements(this.volu_array, i, j);
					}
				}
			}
		}
	}

	swap_elements(array_1, i, j){
		let id_volu = array_1[j][0];
		let id_cont = array_1[j][1];
		let id_type = array_1[j][2];
		let id_mate = array_1[j][3];
		let x = array_1[j][4];
		let y = array_1[j][5];
		let z = array_1[j][6];
		let module_name = array_1[j][7];

		array_1[j][0] = array_1[i][0];
		array_1[j][1] = array_1[i][1];
		array_1[j][2] = array_1[i][2];
		array_1[j][3] = array_1[i][3];
		array_1[j][4] = array_1[i][4];
		array_1[j][5] = array_1[i][5];
		array_1[j][6] = array_1[i][6];
		array_1[j][7] = array_1[i][7];

		array_1[i][0] = id_volu;
		array_1[i][1] = id_cont;
		array_1[i][2] = id_type;
		array_1[i][3] = id_mate;
		array_1[i][4] = x;
		array_1[i][5] = y;
		array_1[i][6] = z;
		array_1[i][7] = module_name;
	}


	hole_reading(line, id_parent_module){
		line = line.trim();
		let line_array = line.split(/\s+/);
		//console.log("hole line ", line);
		if(line_array[0]=="HOLE" || line_array[0]=="TROU"){
			let id_hole = line_array[1];
			let id_cont = line_array[2];
			let id_type = line_array[3];
			let id_son_module = line_array[4];
			let x = parseFloat(line_array[5]);
			let y = parseFloat(line_array[6]);
			let z = parseFloat(line_array[7]);
			//console.log("[id_hole, id_cont, id_type, id_son_module, x, y, z, id_parent_module]", [id_hole, id_cont, id_type, id_son_module, x, y, z, id_parent_module]);
			this.hole_array.push([id_hole, id_cont, id_type, id_son_module, x, y, z, id_parent_module]);
		}
	}


	volu_reading(line, module_name){
		line = line.trim();
		let line_array = line.split(/\s+/);
		if(line_array[0]=="VOLU"){
			let id_volu = line_array[1];
			let id_cont = line_array[2];
			let id_type = line_array[3];
			let id_mate = line_array[4];
			let x = parseFloat(line_array[5]);
			let y = parseFloat(line_array[6]);
			let z = parseFloat(line_array[7]);

			/*
			if (id_cont == 0){ //correctif pour les id_modules à 0 pour des volumes dans d'autres modules que le n°0 (convention d'écriture).
				id_cont = module_name;
			}
			*/
			

			this.volu_array.push([id_volu, id_cont, id_type, id_mate, x, y, z, module_name]);
			//console.log("[id_volu, id_cont, id_type, id_mate, x, y, z, module_name]", [id_volu, id_cont, id_type, id_mate, x, y, z, module_name]);
		
			
			let index_trun = line_array.indexOf('TRUN');
			let index_etsu = line_array.indexOf('ETSU');
			let index_etsup = line_array.indexOf('ETSUP');
			if (index_trun != -1 || index_etsu  != -1 || index_etsup  != -1){
				//console.log('TRUN or ETSU found');
				if (index_trun != -1){
					this.trun_reading(line_array, module_name, id_volu, index_trun);
				} else if (index_etsu != -1){
					//console.log('ETSU found !');
					this.trun_reading(line_array, module_name, id_volu, index_etsu);
				} else {
					this.trun_reading(line_array, module_name, id_volu, index_etsup);
				}
			}
			//console.log("this.trun_array", this.trun_array);

			let index_supe = line_array.indexOf('SUPE');
			let index_ecra = line_array.indexOf('ECRA');
			let index_ecras = line_array.indexOf('ECRAS');
			let max_index_supe = Math.max(index_supe, index_ecra, index_ecras);
			if ( max_index_supe != -1){
				this.supe_reading(line_array, module_name, id_volu, max_index_supe);
			}
			//console.log("supe_array", this.supe_array);

			let index_inte = line_array.indexOf('INTE');
			if ( index_inte != -1){
				this.inte_reading(line_array, module_name, id_volu, index_inte);
			}
			


			
		}
		
	}

	trun_reading(line_array, module_name, id_volu, index_trun){		
		let trun_line = [];
		let nb_truncater = parseInt(line_array[index_trun + 1], 10);
		trun_line.push(module_name);
		trun_line.push(id_volu);
		trun_line.push(nb_truncater);	
		for (let index = index_trun + 2; index < index_trun + 2 + nb_truncater; index++){
			trun_line.push(line_array[index]);	
		}
		this.trun_array.push(trun_line);
		//console.log("line_trun_array", trun_line);
		//shape  trun_line (variable length) => [module_name, id_volu, nb_trucater, id_volu1, id_volu2, ...]
	}


	supe_reading(line_array, module_name, id_volu, index_supe){
		let supe_line = [];
		let nb_truncated = parseInt(line_array[index_supe + 1], 10);
		supe_line.push(module_name);
		supe_line.push(id_volu);
		supe_line.push(nb_truncated);	
		for (let index = index_supe + 2; index < index_supe + 2 + nb_truncated; index++){
			supe_line.push(line_array[index]);	
		}
		this.supe_array.push(supe_line);
		//console.log("line_supe_array", supe_line);
		//shape  supe_line (variable length) => [module_name, id_volu, nb_trucated, id_volu1, id_volu2, ...]
	}

	inte_reading(line_array, module_name, id_volu, index_inte){
		let inte_line = [];
		let nb_intersected = parseInt(line_array[index_inte + 1], 10);
		inte_line.push(module_name);
		inte_line.push(id_volu);
		inte_line.push(nb_intersected);	
		for (let index = index_inte + 2; index < index_inte + 2 + nb_intersected; index++){
			inte_line.push(line_array[index]);	
		}
		this.inte_array.push(inte_line);
		console.log("line_inte_line", inte_line);
		//shape  inte_line (variable length) => [module_name, id_volu, nb_trucated, id_volu1, id_volu2, ...]
	}


	type_reading(line, module_name) { 
		line = line.trim();
		let line_array = line.split(/\s+/);
		if (line_array[0]=="TYPE"){
			if (line_array[2]=="BOX" || line_array[2] == "BOIT" || line_array[2] == "BOITE"){
				//alert("box !")
				let id_type = line_array[1];
				let dx = 2*parseFloat(line_array[3]);
				let dy = 2*parseFloat(line_array[4]);
				let dz = 2*parseFloat(line_array[5]);
				this.type_array.push([id_type, "BOX", dx, dy, dz, module_name]);
			} else if (line_array[2]=="SPHE"){
				//alert("Sphere !")
				let id_type = line_array[1];
				let rayon = parseFloat(line_array[3]);
				this.type_array.push([id_type, "SPHE", rayon, 0, 0, module_name]);
			} else if (line_array[2]=="CYLX" || line_array[2]=="CYLY" || line_array[2]=="CYLZ"){
				//alert("Cylinder !")
				let id_type = line_array[1];
				let type_cyl = line_array[2]; // ="CYLX" par exemple.
				let rayon = parseFloat(line_array[3]);
				let height = 2*parseFloat(line_array[4]);
				this.type_array.push([id_type, type_cyl, rayon, height, 0, module_name]);
			} else if (line_array[2]=="HEXX" || line_array[2]=="HEXY" || line_array[2]=="HEXZ"){
				//alert("hex prism !")
				let id_type = line_array[1];
				let type_hex = line_array[2]; // ="HEXX" par exemple.
				let side = parseFloat(line_array[3]);
				let height = 2*parseFloat(line_array[4]);
				let azimuth = parseFloat(line_array[5]);
				let index_diam = line_array.indexOf("DIAM");
				if ( index_diam!= -1){
					side = line_array[index_diam + 1]/(2*0.866025); //divide by sin(30°)
					height = 2*parseFloat(line_array[index_diam + 2]);
					azimuth = parseFloat(line_array[index_diam + 3]);
				}				
				this.type_array.push([id_type, type_hex, side, height, azimuth, module_name]);
				
			} else if (line_array[2]=="ELLI"){			
			let id_type = line_array[1];
			let a = parseFloat(line_array[3]);
			let b = parseFloat(line_array[4]);
			let c = parseFloat(line_array[5]);
			//console.log("[id_type, ELLI, a, b, c, module_name]", [id_type, "ELLI", a, b, c, module_name]);
			this.type_array.push([id_type, "ELLI", a, b, c, module_name]);

			} else if (line_array[2]=="PLAX" || line_array[2]=="PLAY" || line_array[2]=="PLAZ"){
				//alert("PLA !")
				let id_type = line_array[1];
				let type_pla = line_array[2]; // ="PLAX" for example.
				let supe_or_inf_or_alt_1 = line_array[3];
				let alt_2 = parseFloat(line_array[4]);
				this.type_array.push([id_type, type_pla, supe_or_inf_or_alt_1, alt_2, 0, module_name]);
				//console.log("[id_type, type_pla, supe_or_inf_or_alt_1, alt_2, 0, module_name]", [id_type, type_pla, supe_or_inf_or_alt_1, alt_2, 0, module_name]);
			} else if (line_array[2] == "CYLI" || line_array[2] == "CYLQ"){
				let id_type = line_array[1];
				let radius = parseFloat(line_array[3]);
				let x_a = parseFloat(line_array[4]);
				let y_a = parseFloat(line_array[5]);
				let z_a = parseFloat(line_array[6]);
				let x_b = parseFloat(line_array[7]);
				let y_b = parseFloat(line_array[8]);
				let z_b = parseFloat(line_array[9]);
				this.type_array.push([id_type, "CYLI" ,radius, x_a, y_a, module_name, z_a, x_b, y_b, z_b ]);
				
			}else if (line_array[2]=="CONX" || line_array[2]=="CONY" || line_array[2]=="CONZ"){
				let id_type = line_array[1];
				let type_cone = line_array[2];
				if (line_array.includes('ANGL')){
					let angle = parseFloat(line_array[4]);
					this.type_array.push([id_type, type_cone, 'ANGL', angle, 0, module_name]);
				
				} else{
					let tan = parseFloat(line_array[3]);
					this.type_array.push([id_type, type_cone, 'TAN', tan, 0, module_name]);
				}
			} else{
			//alert("nada");
			}
			let index_rota = line_array.indexOf('ROTA');		
			if ( index_rota != -1){
				let id_type = line_array[1];
				this.rota_reading(line_array, module_name, id_type, index_rota);
			}
			//console.log("rota_array", this.rota_array);
			
			
		}
		//console.log("type_array", this.type_array);
	}


	rota_reading(line_array, module_name, id_type, index_rota){
		let nb_rotations = parseInt(line_array[index_rota + 1], 10);
		var e = ["X","Y","Z"];
		let theta = [0, 0, 0];
		

		for (let n = 0; n < nb_rotations + 1; n++){
			let index = 2*n + index_rota + 2;
			if (line_array[index] == "X"){
				theta[0] = parseFloat(line_array[index + 1]);
			} else if (line_array[index] == "Y"){
				theta[1] = parseFloat(line_array[index + 1]);
			} else if (line_array[index] == "Z"){
				theta[2] = parseFloat(line_array[index + 1]);
			}
		}
		this.rota_array.push([module_name, id_type, nb_rotations, e[0], theta[0], e[1], theta[1], e[2], theta[2]]);
		//console.log("rota_array",this.rota_array);

	}


	mate_reading(line) {
		line = line.trim();
		let line_array = line.split(/\s+/);
		if (line_array[0]=="COMP" || line_array[0]=="COMPO"){
			let id_mate = line_array[1];
			let color = this.mesh_tools.attribute_material_color(id_mate);
			this.mate_array.push([id_mate, color]);					
		}	
		
		if (line_array[0]=="APO2"){
			let id_mate = line_array[1];
			let color = this.mesh_tools.attribute_material_color(id_mate);
			this.mate_array.push([id_mate, color]);					
		}
	}

	getRandomColor() {
		let color = new THREE.Color( 0xffffff );
		color.setHex( Math.random() * 0xffffff );
		return color;
	}

	lattice_reading(text, module_name) { 
		if (text.includes("RESC") || text.includes("LATS")){
			//isolement de la partie du JDD MORET entre RESC et FINR
			//let lattice_regex = new RegExp(/RESC([\s\S]*?)FINR/);
			//let lattice_text = text.match(lattice_regex); 

			text = text.split('RESC').pop().split('FINR')[0];	
			text = text.split('LATS').pop().split('ENDL')[0];	
			//console.log(text);

			if (text != null){
				//separation en lignes
				let lattice_lines = text.split('\n');
				var lattice_found = false;
				//var id_maille;
				
				// lecture des differentes lignes
				for(let i = 0; i < lattice_lines.length ; i++){
					let line = lattice_lines[i].trim();
					let line_array = line.split(/\s+/);
					if(line_array[0]=="MPRI"){
						var id_maille = line_array[1];
						lattice_found = true;
					}
					if(line_array[0] == "DIMR" || line_array[0] == "DIML"){
						var id_nx = parseInt(line_array[1], 10);
						var id_ny = parseInt(line_array[2], 10);
						var id_nz = parseInt(line_array[3], 10);
						
					}

					if (line_array[0] == "DISM" || line_array[0] == "ENLM"){
						let text_dism;
						if (line_array[0] == "DISM"){
							text_dism = text.split("DISM");
						} else{
							text_dism = text.split("ENLM");
						}
						
						text_dism.shift();
						this.dism_reading(module_name, id_maille, text_dism[0]);
					}

					if(line_array[0] == "INDP"){
						var ix = parseInt(line_array[1], 10);
						var iy = parseInt(line_array[2], 10);
						var iz = parseInt(line_array[3], 10);
						var indp_array = [ix, iy, iz];
						
					}
					if (line_array[0] == "MSEC"){
						let text_msec = text.split("MSEC");
						text_msec.shift();
						this.msec_reading(module_name, id_maille, text_msec[0]);
					}

					if (line_array[0] == "NAPP" || line_array[0] == "LAYE"){
						let text_napp = text.split("NAPP");
						text_napp.shift();
						//console.log('text_napp', text_napp);
						this.napp_reading(module_name, id_maille, id_nx, id_ny, text_napp[0]);
					}
				}
				if (lattice_found){
					this.lattice_array.push([module_name, id_maille, id_nx, id_ny, id_nz, indp_array]);
					console.log("this.lattice_array", this.lattice_array);
				}			
				
			}
		}
	}


	lattice_reading_hex(text, module_name){
		if (text.includes("RESH") || text.includes("LATH")){
			text = text.split('RESH').pop().split('FINR')[0];
			text = text.split('LATH').pop().split('ENDL')[0];
			
			//console.log("text hex", text);

			if (text != null){
				let lattice_lines = text.split('\n');
				var lattice_found = false;

				for(let i = 0; i < lattice_lines.length ; i++){
					let line = lattice_lines[i].trim();
					let line_array = line.split(/\s+/);
					if(line_array[0]=="MPRI"){
						var id_maille = line_array[1];
						lattice_found = true;
					}
					if(line_array[0] == "DIMR" || line_array[0] == "DIML"){
						var id_nr = parseInt(line_array[1], 10);
						var id_nz = parseInt(line_array[2], 10);
						
					}
					if(line_array[0] == "INDP"){
						var ix = parseInt(line_array[1], 10);
						var iy = parseInt(line_array[2], 10);
						var iz = parseInt(line_array[3], 10);
						var indp_array = [ix, iy, iz];
						
					}					
					if (line_array[0] == "MSEC"){
						let text_msec = text.split("MSEC");
						text_msec.shift();
						this.msec_reading(module_name, id_maille, text_msec[0]);
					}
					
					/*
					//NAPP pour les réseaux hexadecimaux à travailler
					if (line_array[0] == "NAPP" || line_array[0] == "LAYE"){
						let text_napp = text.split("NAPP");
						text_napp.shift();
						//console.log('text_napp', text_napp);
						this.napp_reading(module_name, id_maille, id_nx, id_ny, text_napp[0]);
					}
					*/
				}
				if (lattice_found){
					this.lattice_array_hex.push([module_name, id_maille, id_nr, id_nz, 0, indp_array]);
				}			
				//console.log("lattice_array_hex", this.lattice_array_hex);
				
			}
			/*
			if (isNaN(id_nz)){
				id_nz = 1;
			}
			*/
			}
		
	}

	msec_reading(module_name, id_mpri, text_msec){
		let msec_lines = text_msec.split('\n');
		let first_line = msec_lines[0].trim();
		let first_line_array = first_line.split(/\s+/);

		let id_msec = first_line_array[0];
		let nb_msec = first_line_array[1];
		this.msec_lattice_array.push([module_name, id_mpri, id_msec, nb_msec]);

		let x1 = first_line_array[2];
		let y1 = first_line_array[3];
		let z1 = first_line_array[4];		
		this.msec_lattice_array.push([module_name, id_mpri, x1, y1, z1]);

		for (let i = 1 ; i < nb_msec; i++){
			let line = msec_lines[i].trim();
			let line_array = line.split(/\s+/);
			let x = line_array[0];
			let y = line_array[1];
			let z = line_array[2];
			this.msec_lattice_array.push([module_name, id_mpri, x, y, z]);
		}
		console.log("msec_lattice_array",this.msec_lattice_array);
	}

	dism_reading(module_name, id_mpri, text_dism){
		let dism_lines = text_dism.split('\n');
		let first_line = dism_lines[0].trim();
		let first_line_array = first_line.split(/\s+/);

		let nb_dism = parseInt(first_line_array[0]);
		this.dism_lattice_array.push([module_name, id_mpri, nb_dism]);

		let x1 = parseInt(first_line_array[1]);
		let y1 = parseInt(first_line_array[2]);
		let z1 = parseInt(first_line_array[3]);		
		this.dism_lattice_array.push([module_name, id_mpri, x1, y1, z1]);

		for (let i = 1 ; i < nb_dism; i++){
			let line = dism_lines[i].trim();
			let line_array = line.split(/\s+/);
			let x = parseInt(line_array[0]);
			let y = parseInt(line_array[1]);
			let z = parseInt(line_array[2]);
			this.dism_lattice_array.push([module_name, id_mpri, x, y, z]);
		}
		console.log("dism_lattice_array",this.dism_lattice_array);
	}

	napp_reading(module_name, id_mpri, id_nx, id_ny, text_napp){
		let temporary_array = [];
		let msec_list = [];

		let napp_lines = text_napp.split('\n');
		console.log('napp_lines', napp_lines);
		console.log('id_nx, id_ny', id_nx, id_ny);

		for (let j = 1 ; j < (id_ny + 1); j++){
		//for (let j = 0 ; j < id_ny; j++){
			console.log('napp_lines[j]', j, napp_lines[j]);
			let line = napp_lines[j].trim();
			let line_array = line.split(/\s+/);
			for (let k = 0 ; k < id_nx; k++){
				if (line_array[k] != id_mpri){
					let id_msec = line_array[k];				
					let x = j - 1;
					//let y = k + 1;
					let y = k;
					//let z = 1;
					let z = 0;
					temporary_array.push([id_msec, x, y, z]);

					let col_id_msec = msec_list.map(function(value,index) { return value[0]; });	
					if (col_id_msec.includes(id_msec)){
						let msec = msec_list.find(el => el[0] === id_msec);
						msec[1] += 1;						
					} else {
						msec_list.push([id_msec, 1]);						
					}
				}
			}
		}
		console.log('napp temporary_array', temporary_array);
		console.log('napp msec_list', msec_list);

		//pushing data in the this.msec_lattice_array
		for (let msec of msec_list){
			let id_msec = msec[0];
			let nb_msec = msec[1];
			this.msec_lattice_array.push([module_name, id_mpri, id_msec, nb_msec]);
			let filtered_temporary_array = temporary_array.filter(el => el[0] === id_msec);
			for (let line of filtered_temporary_array){
				let x = line[1];
				let y = line[2];
				let z = line[3];
				this.msec_lattice_array.push([module_name, id_mpri, x, y, z]);
			}
		}
		console.log("napp msec_lattice_array",this.msec_lattice_array);
	}
	

	mpla_reading(text, module_name){
		console.log("mpla reading...");		
		if (text.includes("MPLA") || text.includes("PPLA")){
			let lines = text.split('\n');			
			for(let i = 0; i < lines.length ; i++){
				if (lines[i].includes("MPLA")|| lines[i].includes("PPLA")){					
					let mpla_temporary_array = [];
					let line_array = lines[i].trim().split(/\s+/);
					let id_type = line_array[1];
					//console.log("line_array", line_array);
					let p = parseFloat(line_array[3]);
					//console.log("p :", p);
					
					let x_a = parseFloat(line_array[4]);
					let y_a = parseFloat(line_array[5]);
					let z_a = parseFloat(line_array[6]);
					let x_b = parseFloat(line_array[7]);
					let y_b = parseFloat(line_array[8]);
					let z_b = parseFloat(line_array[9]);
					let x_c = parseFloat(line_array[10]);
					let y_c = parseFloat(line_array[11]);
					let z_c = parseFloat(line_array[12]);
					mpla_temporary_array.push([x_a,y_a,z_a,x_b,y_b,z_b,x_c,y_c,z_c]);
					for (let j = 1; j < p; j++){
						line_array = lines[i+j].trim().split(/\s+/);
						//console.log("line_array", line_array);
						x_a = parseFloat(line_array[0]);
						y_a = parseFloat(line_array[1]);
						z_a = parseFloat(line_array[2]);
						x_b = parseFloat(line_array[3]);
						y_b = parseFloat(line_array[4]);
						z_b = parseFloat(line_array[5]);
						x_c = parseFloat(line_array[6]);
						y_c = parseFloat(line_array[7]);
						z_c = parseFloat(line_array[8]);
						mpla_temporary_array.push([x_a,y_a,z_a,x_b,y_b,z_b,x_c,y_c,z_c]);
					}
					line_array = lines[i + p].trim().split(/\s+/);
					let vector_I = [];
					let x_I = parseFloat(line_array[0]);
					let y_I = parseFloat(line_array[1]);
					let z_I = parseFloat(line_array[2]);					
					vector_I.push([x_I,y_I,z_I]);

					//console.log("mpla_temporary_array", mpla_temporary_array);

					this.type_array.push([id_type, "MPLA", mpla_temporary_array, vector_I, 0 , module_name])
					//[id_type, "BOX", dx, dy, dz, module_name]
				}
			} 				
			//console.log("this.type_array", this.type_array);
		}
	}


}
