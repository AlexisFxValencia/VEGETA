
class moretReader{
	constructor(){
        this.mesh_tools = new meshTools();
		this.modu_array = [];
		this.type_array = [];
		this.volu_array = [];
		this.mate_array = [];	
		this.apo_2_array = [];	
		this.lattice_array = [];
		this.lattice_array_hex = [];
		this.msec_lattice_array = [];	
		this.dism_lattice_array = [];
		this.disb_lattice_array = [];
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
		this.disb_lattice_array = [];
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
		text = text.replace(/\t/g, " ");
		text = text.replace(/\bMODU\w*/g, "MODU"); // remplace les mots qui commencent par "MODU" par "MODU"
		text = text.replace(/\bECRA\w*/g, "SUPE");
		text = text.replace(/\bSUPE\w*/g, "SUPE");
		text = text.replace(/\bETSU\w*/g, "TRUN");
		text = text.replace(/\bTRUN\w*/g, "TRUN");
		text = text.replace(/VOLUME/g, 'VOLU'); // remplace l		
		text = text.replace(/\bBOIT\w*/g, "BOX");
		//text = text.replace(/\bBOX\w*/g, "BOX"); //mauvaise idée
		//text = text.replace(/\bSPHE\w*/g, "SPHE");
		
		text = text.replace(/VOLU/g, "\nVOLU"); // épuration des JDD auxquels ils manque des sauts de ligne.
		text = text.replace(/TROU/g, "\nTROU"); // épuration des JDD auxquels ils manque des sauts de ligne.
		text = text.replace(/DIMR/g, "\nDIMR"); // épuration des JDD auxquels ils manque des sauts de ligne.

		text = text.replace(/\s+SUPE/g, ' SUPE'); // évite des SUPE seuls sur leur ligne (les rattache au volume précédent)	
		text = text.replace(/\s+INTE/g, ' INTE'); // évite des INTE seuls sur leur ligne (les rattache au volume précédent)
		text = text.replace(/\s+TRUN/g, ' TRUN'); // évite des TRUN seuls sur leur ligne (les rattache au volume précédent)
		text = text.replace(/\s+ROTA/g, ' ROTA'); // évite des ROTA seuls sur leur ligne (les rattache au volume précédent)

		text = text.replace(/\s+BORD/g, ' BORD'); // évite des BORD seuls sur leur ligne (les rattache au DISB précédent)


		text = text.replace(/^\s+/gm, ''); // supprime les caractères d'espacement de début de ligne.
		
		text = text.replace(/\n+(\d+\.\d+)\s*/g, " $1 "); // supprime le sauts de ligne du début d'une ligne si celle-ci commence par un nombre.
		text = text.replace(/\n+(\d+)\s*/g, " $1 "); // supprime le sauts de ligne du début d'une ligne si celle-ci commence par un nombre.
		text = text.replace(/\n+(-\d+)\s*/g, " $1 "); // idem avec un nombre Négatif.


		
		


		text = text.replace(/\n+/gm, '\n');
		console.log(text);

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

		//console.log("apo_2_array", this.apo_2_array);
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
		//console.log("text_modu_array : ", text_modu_array);
		//correctif au cas où on met un JDD partiel sans nom de module, le module standard est 0
		if (text_modu_array.length < 2){
			var new_text_modu_array = ['MODU 0'].concat(text_modu_array);
			text = new_text_modu_array.join(" ");
			text_modu_array = text.split("MODU");
		}

		text_modu_array.shift();
		for(let j = 0; j < text_modu_array.length ; j++){
			//console.log("mon module splité : ", text_modu_array[j].trim().split(" ")[0]);
			let module_name = text_modu_array[j].trim();
			module_name = module_name.replace(/\n+/gm, ' ');
			module_name = module_name.split(" ")[0]; //fonctionne avec un nombre quelconque de modules
			
			this.modu_array.push(module_name);

			this.lattice_reading(text_modu_array[j], module_name);
			this.lattice_reading_hex(text_modu_array[j], module_name);
			
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
		//console.log("this.volu_array", this.volu_array);
	}

	check_volu_order(){
		console.log("checking volumes order");
		for (let nb_iteration = 0; nb_iteration < 3; nb_iteration++){
			for (let i = 0; i < this.volu_array.length -1 ; i++){
				for (let j = i+1; j <  this.volu_array.length ; j++){
					if (this.volu_array[i].id_cont == this.volu_array[j].id && this.volu_array[i].id_modu == this.volu_array[j].id_modu ){
						//console.log("i and j : ", i, " ", j);
						console.log("swap :", this.volu_array[i].id, " and ", this.volu_array[j].id);
						this.swap_elements(this.volu_array, i, j);
					}
				}
			}
		}
	}

	swap_elements(array_1, i, j){
		let id = array_1[j].id;
		let id_cont = array_1[j].id_cont;
		let id_type = array_1[j].id_type;
		let id_mate = array_1[j].id_mate;
		let x = array_1[j].x;
		let y = array_1[j].y;
		let z = array_1[j].z;
		let id_modu = array_1[j].id_modu;

		array_1[j].id = array_1[i].id;
		array_1[j].id_cont = array_1[i].id_cont;
		array_1[j].id_type = array_1[i].id_type;
		array_1[j].id_mate = array_1[i].id_mate;
		array_1[j].x = array_1[i].x;
		array_1[j].y = array_1[i].y;
		array_1[j].z = array_1[i].z;
		array_1[j].id_modu = array_1[i].id_modu;

		array_1[i].id = id;
		array_1[i].id_cont = id_cont;
		array_1[i].id_type = id_type;
		array_1[i].id_mate = id_mate;
		array_1[i].x = x;
		array_1[i].y = y;
		array_1[i].z = z;
		array_1[i].id_modu = id_modu;
	}


	hole_reading(line, module_name){
		line = line.trim();
		let line_array = line.split(/\s+/);
		if(line_array[0]=="HOLE" || line_array[0]=="TROU"){
			const hole = {
				id: line_array[1], 
				id_cont: line_array[2], 
				id_type: line_array[3], 
				id_mate: line_array[4], 
				x: parseFloat(line_array[5]), 
				y: parseFloat(line_array[6]), 
				z: parseFloat(line_array[7]), 
				id_modu: module_name,
			};
			this.hole_array.push(hole);		
		
			
			let index_trun = line_array.indexOf('TRUN');
			if (index_trun != -1){
				this.trun_reading(line_array, module_name, hole.id, index_trun, true);
			}
				
			let index_supe = line_array.indexOf('SUPE');
			if ( index_supe != -1){
				this.supe_reading(line_array, module_name, hole.id, index_supe, true);
			}
			
			let index_inte = line_array.indexOf('INTE');
			if ( index_inte != -1){
				this.inte_reading(line_array, module_name, hole.id, index_inte, true);
			}	
			
		}
	}


	volu_reading(line, module_name){
		line = line.trim();
		let line_array = line.split(/\s+/);
		if(line_array[0]=="VOLU"){
			const volu = {
				id: line_array[1], 
				id_cont: line_array[2], 
				id_type: line_array[3], 
				id_mate: line_array[4], 
				x: parseFloat(line_array[5]), 
				y: parseFloat(line_array[6]), 
				z: parseFloat(line_array[7]), 
				id_modu: module_name,
			};
			this.volu_array.push(volu);

			let index_trun = line_array.indexOf('TRUN');
			if (index_trun != -1){
				this.trun_reading(line_array, module_name, volu.id, index_trun, false);
			}
			
			let index_supe = line_array.indexOf('SUPE');
			if ( index_supe != -1){
				this.supe_reading(line_array, module_name, volu.id, index_supe, false);
			}
			
			let index_inte = line_array.indexOf('INTE');
			if ( index_inte != -1){
				this.inte_reading(line_array, module_name, volu.id, index_inte, false);
			}						
		}
		//console.log("this.trun_array", this.trun_array);
		
	}

	trun_reading(line_array, module_name, id, index_trun, for_hole){				
		let nb_truncater = parseInt(line_array[index_trun + 1], 10);
		let truncater_objects = [];
		for (let i = index_trun + 2; i < index_trun + 2 + nb_truncater; i++){
			truncater_objects.push(line_array[i]);	
		}
		const trun = {
			id : id,
			id_modu: module_name,
			nb_truncater: nb_truncater,
			truncater_objects: truncater_objects,
			for_hole: for_hole
		};
		this.trun_array.push(trun);
	}


	supe_reading(line_array, module_name, id, index_supe, for_hole){
		let nb_truncated = parseInt(line_array[index_supe + 1], 10);
		let truncated_objects = [];
		for (let i = index_supe + 2; i < index_supe + 2 + nb_truncated; i++){
			truncated_objects.push(line_array[i]);	
		}
		const supe = {
			id : id,
			id_modu: module_name,
			nb_truncated: nb_truncated,
			truncated_objects: truncated_objects,
			for_hole: for_hole
		};
		this.supe_array.push(supe);
	}

	inte_reading(line_array, module_name, id, index_inte, for_hole){
		let nb_intersected = parseInt(line_array[index_inte + 1], 10);
		let intersected_objects = [];
		for (let i = index_inte + 2; i < index_inte + 2 + nb_intersected; i++){
			intersected_objects.push(line_array[i]);	
		}
		const inte = {
			id : id,
			id_modu: module_name,
			nb_intersected: nb_intersected,
			intersected_objects: intersected_objects,
			for_hole: for_hole
		};
		this.inte_array.push(inte);
	}


	type_reading(line, module_name) { 
		line = line.trim();
		let line_array = line.split(/\s+/);
		if (line_array[0]=="TYPE"){
			let parameters;
			let shape;
			let id_type;
			if (line_array[2]=="BOX" || line_array[2] == "BOIT" || line_array[2] == "BOITE"){
				id_type = line_array[1];
				let dx = 2*parseFloat(line_array[3]);
				let dy = 2*parseFloat(line_array[4]);
				let dz = 2*parseFloat(line_array[5]);
				parameters = {
					dx: dx,
					dy: dy,
					dz: dz,
				}
				shape = "BOX";				

			} else if (line_array[2]=="LBOX" || line_array[2] == "LBOITE"){
				id_type = line_array[1];
				let dx = parseFloat(line_array[3]);
				let dy = parseFloat(line_array[4]);
				let dz = parseFloat(line_array[5]);
				parameters = {
					dx: dx,
					dy: dy,
					dz: dz,
				}
				shape = "BOX";	
			} else if (line_array[2]=="SPHE"){
				id_type = line_array[1];
				let radius = parseFloat(line_array[3]);
				parameters = {
					radius: radius,
				}
				shape = "SPHE";	
			} else if (line_array[2]=="CYLX" || line_array[2]=="CYLY" || line_array[2]=="CYLZ"){
				id_type = line_array[1];
				let type_cyl = line_array[2]; // ="CYLX" for example.
				let radius = parseFloat(line_array[3]);
				let height = 2*parseFloat(line_array[4]);
				parameters = {
					radius: radius,
					height: height,
					type_cyl: type_cyl,
				}
				shape = type_cyl;	
			} else if (line_array[2]=="HEXX" || line_array[2]=="HEXY" || line_array[2]=="HEXZ"){
				id_type = line_array[1];
				let type_hex = line_array[2]; // ="HEXX" for example.
				let side = parseFloat(line_array[3]);
				let height = 2*parseFloat(line_array[4]);
				let azimuth = parseFloat(line_array[5]);
				let index_diam = line_array.indexOf("DIAM");
				if ( index_diam!= -1){
					side = line_array[index_diam + 1]/(2*0.866025); //divide by sin(30°)
					height = 2*parseFloat(line_array[index_diam + 2]);
					azimuth = parseFloat(line_array[index_diam + 3]);
				}				
				parameters = {
					type_hex: type_hex,
					side: side,
					height: height,
					azimuth: azimuth
				}
				shape = type_hex;	

			} else if (line_array[2]=="ELLI"){			
			id_type = line_array[1];
			let a = parseFloat(line_array[3]);
			let b = parseFloat(line_array[4]);
			let c = parseFloat(line_array[5]);
			parameters = {
				a: a,
				b: b,
				c: c,
			}
			shape = "ELLI";

			} else if (line_array[2]=="PLAX" || line_array[2]=="PLAY" || line_array[2]=="PLAZ"){
				id_type = line_array[1];
				let type_pla = line_array[2]; // ="PLAX" for example.
				let supe_or_inf_or_alt_1 = line_array[3];
				let alt_2 = parseFloat(line_array[4]);
				parameters = {
					type_pla: type_pla,
					supe_or_inf_or_alt_1: supe_or_inf_or_alt_1,
					alt_2: alt_2,
				}
				shape = type_pla;
			} else if (line_array[2] == "CYLI" || line_array[2] == "CYLQ"){
				id_type = line_array[1];
				let radius = parseFloat(line_array[3]);
				let x_a = parseFloat(line_array[4]);
				let y_a = parseFloat(line_array[5]);
				let z_a = parseFloat(line_array[6]);
				let x_b = parseFloat(line_array[7]);
				let y_b = parseFloat(line_array[8]);
				let z_b = parseFloat(line_array[9]);
				parameters = {
					radius: radius,
					x_a: x_a,
					y_a: y_a,
					z_a: z_a,
					x_b: x_b,
					y_b: y_b,
					z_b: z_b,
				}
				shape = "CYLI";
				
			}else if (line_array[2]=="CONX" || line_array[2]=="CONY" || line_array[2]=="CONZ"){
				id_type = line_array[1];
				let type_cone = line_array[2];
				if (line_array.includes('ANGL')){
					let angle = parseFloat(line_array[4]);
					parameters = {
						type_cone: type_cone,
						angle_or_tan: 'ANGL',
						angle: angle,
					}
					shape = type_cone;
				
				} else{
					let tan = parseFloat(line_array[3]);
					parameters = {
						type_cone: type_cone,
						angle_or_tan: 'TAN',
						tan: tan,
					}
					shape = type_cone;
				}
			} else if(line_array[2] == "MPLA" || line_array[2] == "PPLA"){
				id_type = line_array[1];
				shape = "MPLA";
				parameters = this.mpla_reading(line_array); 
			}else{
			//alert("nada");
			}

			const type = {
				id: id_type, 
				id_modu: module_name,
				shape: shape, 
				parameters:parameters,
			};
			this.type_array.push(type);



			let index_rota = line_array.indexOf('ROTA');		
			if ( index_rota != -1){
				let id_type = line_array[1];
				this.rota_reading(line_array, module_name, id_type, index_rota);
			}
			//console.log("rota_array", this.rota_array);
			let index_obli= line_array.indexOf('OBLI');		
			if ( index_obli != -1){
				let id_type = line_array[1];
				this.obli_reading(line_array, module_name, id_type, index_obli);
			}
			
			
		}
		//console.log("type_array", this.type_array);
	}


	rota_reading(line_array, module_name, id_type, index_rota){
		let nb_rotations = parseInt(line_array[index_rota + 1], 10);
		let elementary_rotations = [];
		for (let n = 0; n < nb_rotations + 1; n++){
			let index = 2*n + index_rota + 2;
			if (line_array[index] == "X"){
				let theta_x = parseFloat(line_array[index + 1]);
				let rotation = {
					type: 'X',
					theta: theta_x,
				}
				elementary_rotations.push(rotation);
			} else if (line_array[index] == "Y"){
				let theta_y = parseFloat(line_array[index + 1]);
				let rotation = {
					type: 'Y',
					theta: theta_y,
				};
				elementary_rotations.push(rotation);
			} else if (line_array[index] == "Z"){
				let theta_z = parseFloat(line_array[index + 1]);
				let rotation = {
					type: 'Z',
					theta: theta_z,
				};
				elementary_rotations.push(rotation);
			}
		}
		let rota = {
			id_type : id_type,
			id_modu: module_name,
			nb_rotations: nb_rotations,
			elementary_rotations: elementary_rotations,
		};
		this.rota_array.push(rota);

		//console.log("rota_array",this.rota_array);

	}

	obli_reading(line_array, module_name, id_type, index_obli){
		let theta_z = parseFloat(line_array[index_obli + 1]);
		let rotation = {
			type: 'Z',
			theta: theta_z,
		};
		let elementary_rotations = [];
		elementary_rotations.push(rotation);
		let rota = {
			id_type : id_type,
			id_modu: module_name,
			nb_rotations: 1,
			elementary_rotations: elementary_rotations,
		};
		this.rota_array.push(rota);
	}


	mate_reading(line) {
		line = line.trim();
		let line_array = line.split(/\s+/);
		if (line_array[0]=="COMP" || line_array[0]=="COMPO"){
			let id_mate = line_array[1];	
			let color = this.mesh_tools.attribute_material_color(id_mate);			
			let mate = {
				id_mate: id_mate,
				color: color,
			};
			this.mate_array.push(mate);	
		}	
		
		if (line_array[0]=="APO2"){
			let id_mate = line_array[1];
			let color = this.mesh_tools.attribute_material_color(id_mate);
			let mate = {
				id_mate: id_mate,
				color: color,
			};
			this.mate_array.push(mate);				
		}
	}

	getRandomColor() {
		let color = new THREE.Color( 0xffffff );
		color.setHex( Math.random() * 0xffffff );
		return color;
	}

	lattice_reading(text, module_name) { 
		if (text.includes("RESC") || text.includes("LATS")){
			text = text.split('RESC').pop().split('FINR')[0];	
			text = text.split('LATS').pop().split('ENDL')[0];	
			if (text != null){
				let lattice_lines = text.split('\n');
				let lattice_found = false;	
				
				let id_mpri;
				let nx;
				let ny;
				let nz;
				let ix;
				let iy;
				let iz;
				let indp_array;

				for(let i = 0; i < lattice_lines.length ; i++){
					let line = lattice_lines[i].trim();
					let line_array = line.split(/\s+/);
					if(line_array[0]=="MPRI"){
						id_mpri = line_array[1];
						lattice_found = true;
					}
					if(line_array[0] == "DIMR" || line_array[0] == "DIML"){
						nx = parseInt(line_array[1], 10);
						ny = parseInt(line_array[2], 10);
						nz = parseInt(line_array[3], 10);						
					}

					if (line_array[0] == "DISM" || line_array[0] == "ENLM"){
						this.dism_reading(module_name, id_mpri, line_array);
					}

					if (line_array[0] == "DISB" || line_array[0] == "ENLB"){
						this.disb_reading(module_name, id_mpri, line_array);
					}

					if(line_array[0] == "INDP"){
						ix = parseInt(line_array[1], 10);
						iy = parseInt(line_array[2], 10);
						iz = parseInt(line_array[3], 10);
						indp_array = [ix, iy, iz];						
					}

					if (line_array[0] == "MSEC"){
						let text_msec = text.split("MSEC");
						text_msec.shift();
						this.msec_reading(module_name, id_mpri, text_msec[0]);
					}

					if (line_array[0] == "NAPP" || line_array[0] == "LAYE"){
						this.napp_reading(module_name, id_mpri, nx, ny, line_array);	
					}
				}
				if (lattice_found){
					const lattice = {						
						id_modu: module_name,
						id_mpri: id_mpri,
						nx: nx,
						ny: ny,
						nz: nz,
						indp_array: indp_array,
					};
					this.lattice_array.push(lattice);
					console.log("this.lattice_array", this.lattice_array);
				}			
				
			}
		}
	}


	lattice_reading_hex(text, module_name){
		if (text.includes("RESH") || text.includes("LATH")){
			text = text.split('RESH').pop().split('FINR')[0];
			text = text.split('LATH').pop().split('ENDL')[0];
			
			if (text != null){
				let lattice_lines = text.split('\n');
				let lattice_found = false;

				let id_mpri;
				let nr;
				let nz;
				let ix;
				let iy;
				let iz;
				let indp_array;

				for(let i = 0; i < lattice_lines.length ; i++){
					let line = lattice_lines[i].trim();
					let line_array = line.split(/\s+/);
					if(line_array[0]=="MPRI"){
						id_mpri = line_array[1];
						lattice_found = true;
					}
					if(line_array[0] == "DIMR" || line_array[0] == "DIML"){
						nr = parseInt(line_array[1], 10);
						nz = parseInt(line_array[2], 10);
						
					}
					if(line_array[0] == "INDP"){
						ix = parseInt(line_array[1], 10);
						iy = parseInt(line_array[2], 10);
						iz = parseInt(line_array[3], 10);
						indp_array = [ix, iy, iz];
						
					}					
					if (line_array[0] == "MSEC"){
						let text_msec = text.split("MSEC");
						text_msec.shift();
						this.msec_reading(module_name, id_mpri, text_msec[0]);
					}
					
					/*
					//NAPP pour les réseaux hexadecimaux à travailler
					if (line_array[0] == "NAPP" || line_array[0] == "LAYE"){
						let text_napp = text.split("NAPP");
						text_napp.shift();
						//console.log('text_napp', text_napp);
						this.napp_reading(module_name, id_mpri, nx, ny, text_napp[0]);
					}
					*/
				}
				if (lattice_found){
					const lattice_hex = {						
						id_modu: module_name,
						id_mpri: id_mpri,
						nr: nr,
						nz: nz,
						indp_array: indp_array,
					};
					this.lattice_array_hex.push(lattice_hex);
				}			
				//console.log("lattice_array_hex", this.lattice_array_hex);
				
			}
			/*
			if (isNaN(nz)){
				nz = 1;
			}
			*/
			}
		
	}

	msec_reading(module_name, id_mpri, text_msec){
		let line_array = text_msec.trim().split(/\s+/);
		let id_msec = line_array[0];
		let nb_msec = parseInt(line_array[1]);
		
		let coordinates = [];
		for (let i = 0 ; i < nb_msec; i++){
			let x = line_array[3 * i + 2];
			let y = line_array[3 * i + 3];
			let z = line_array[3 * i + 4];
			coordinates.push([x, y, z]);
		}

		const msec = {						
			id_modu: module_name,
			id_mpri: id_mpri,
			id_msec: id_msec,
			nb_msec: nb_msec,
			coordinates: coordinates,
		};
		this.msec_lattice_array.push(msec);

		console.log("msec_lattice_array",this.msec_lattice_array);
	}


	dism_reading(module_name, id_mpri, line_array){
		let nb_dism = parseInt(line_array[1]);
		let coordinates = [];
		let x1 = parseInt(line_array[2]);
		let y1 = parseInt(line_array[3]);
		let z1 = parseInt(line_array[4]);		
		coordinates.push([x1, y1, z1]);
		for (let i = 1 ; i < nb_dism; i++){
			let x = parseInt(line_array[3 * i + 2]);
			let y = parseInt(line_array[3 * i + 3]);
			let z = parseInt(line_array[3 * i + 4]);
			coordinates.push([x, y, z]);
		}
		console.log("dism_lattice_array",this.dism_lattice_array);

		const dism = {
			id_modu: module_name,
			id_mpri: id_mpri,
			nb_dism: nb_dism,
			coordinates: coordinates,
		};
		this.dism_lattice_array.push(dism);

	}

	disb_reading(module_name, id_mpri, line_array){
		let id_volu = line_array[2];
		
		const disb = {
			id_modu: module_name,
			id_mpri: id_mpri,
			id_volu: id_volu,
		};
		this.disb_lattice_array.push(disb);
		console.log("this.disb_lattice_array :", this.disb_lattice_array)
	}

	napp_reading(module_name, id_mpri, nx, ny, text_napp){		
		let napp_coordinates = [];
		let msec_list = [];
		
		let offset = 2;
		for (let j = 0 ; j < ny ; j++){
			for (let k = 0 ; k < nx; k++){
				let id_msec = text_napp[j * ny + k + offset];	
				if (id_msec != id_mpri){								
					let x = j ;
					let y = k;
					let z = 0;
					napp_coordinates.push([id_msec, x, y, z]);

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

		console.log('napp_coordinates', napp_coordinates);
		console.log('napp msec_list', msec_list);

		let coordinates = [];
		//pushing data in the this.msec_lattice_array
		for (let msec of msec_list){
			let id_msec = msec[0];
			let nb_msec = msec[1];
			let filtered_napp_coordinates = napp_coordinates.filter(el => el[0] === id_msec);
			for (let line of filtered_napp_coordinates){
				let x = line[1];
				let y = line[2];
				let z = line[3];
				coordinates.push([x, y, z]);
			}

			const final_msec = {						
				id_modu: module_name,
				id_mpri: id_mpri,
				id_msec: id_msec,
				nb_msec: nb_msec,
				coordinates: coordinates,
			};
			this.msec_lattice_array.push(final_msec);
		}
		
		

		console.log("napp msec_lattice_array",this.msec_lattice_array);
	}
	

	mpla_reading(line_array){
		console.log("mpla reading...");		
		let planes_list = [];
		let p = parseInt(line_array[3]);
		let offset = 4;
		for (let i = 0; i < p; i++){
			let point_a = new THREE.Vector3();
			let point_b = new THREE.Vector3();
			let point_c = new THREE.Vector3();
			point_a.x = parseFloat(line_array[9 * i + 0 + offset]);
			point_a.y = parseFloat(line_array[9 * i + 1 + offset]);
			point_a.z = parseFloat(line_array[9 * i + 2 + offset]);
			point_b.x = parseFloat(line_array[9 * i + 3 + offset]);
			point_b.y = parseFloat(line_array[9 * i + 4 + offset]);
			point_b.z= parseFloat(line_array[9 * i + 5 + offset]);
			point_c.x = parseFloat(line_array[9 * i + 6 + offset]);
			point_c.y = parseFloat(line_array[9 * i + 7 + offset]);
			point_c.z = parseFloat(line_array[9 * i + 8 + offset]);
			let plane = {
				point_a: point_a,
				point_b: point_b,
				point_c: point_c,
			};
			planes_list.push(plane);
		}

		let vector_I = new THREE.Vector3();
		vector_I.x = parseFloat(line_array[9*p + offset + 0]);
		vector_I.y = parseFloat(line_array[9*p + offset + 1]);
		vector_I.z = parseFloat(line_array[9*p + offset + 2]);	

		let parameters = {
			planes_list: planes_list,
			vector_I: vector_I,
		}		
		return parameters;
		
		
	}
	

	



}
