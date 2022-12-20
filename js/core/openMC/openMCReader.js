
class openMCReader{
	constructor(mesh_tools){
		this.mesh_tools = mesh_tools;
		this.surface_array = [];
		this.cell_array = [];
		this.mate_array = [];
	}

	
	

	parsing_xml(text_xml){
		console.log("XML parsing...");
		var parser = new DOMParser();
		var xml = parser.parseFromString(text_xml,"text/xml");
		//console.log(xml);
		this.parse_surfaces(xml);
		this.parse_cells(xml);
		this.parsing_mates();

	}

	parse_surfaces(xml){
		var surfaces = xml.getElementsByTagName("surface");


		//A GARDER, il fuat juste créer un "this.surface_array_points" pour garder les points aussi
		/*
		for (var i = 0; i < surfaces.length; i++) {   
			let id = surfaces[i].attributes.id.nodeValue;
			let type = surfaces[i].attributes.type.nodeValue;
			let coeff = parseFloat(surfaces[i].attributes.coeffs.nodeValue);
			
			//console.log("surface : ", id, " coeff : ", coeff, "type : ", type);
			let parsed_surface = new surface(id, type, coeff);
			this.surface_array_points.push(parsed_surface);
		}   
		*/
		
		//console.log(this.surface_array);

		
		for (var i = 0; i < surfaces.length; i++) {  
			let id = surfaces[i].attributes.id.nodeValue;
			let type = surfaces[i].attributes.type.nodeValue;
			let coeff_list = surfaces[i].attributes.coeffs.nodeValue.split(' ');
			
			
			if (coeff_list.length == 1){
				let coeff = parseFloat(coeff_list[0]);
				if (type == "x-plane"){
					let plane_1 = new plane(1, 0, 0, -coeff);
					plane_1.id = id;
					plane_1.type = type;
					this.surface_array.push(plane_1);				
				} else if (type == "y-plane"){
					let plane_1 = new plane(0, 1, 0, -coeff);
					plane_1.id = id;
					plane_1.type = type;
					this.surface_array.push(plane_1);
				} else if (type == "z-plane"){
					let plane_1 = new plane(0, 0, 1, -coeff);
					plane_1.id = id;
					plane_1.type = type;
					this.surface_array.push(plane_1);
				} 
			}
				
			if (type == "sphere"){
				console.log(coeff_list);
				let radius = parseFloat(coeff_list[3]);
				let x_center = parseFloat(coeff_list[0]);
				let y_center = parseFloat(coeff_list[1]);
				let z_center = parseFloat(coeff_list[2]);
				
				let sphere_1 = new sphere(radius, x_center, y_center, z_center);
				console.log(sphere_1);
				sphere_1.id = id;
				sphere_1.type = type;
				this.surface_array.push(sphere_1);
			}
			

		}

		console.log("this.surface_array", this.surface_array);	
		

	}

	parse_cells(xml){
		var cells = xml.getElementsByTagName("cell");
		for (var i = 0; i < cells.length; i++) {   
			let id = cells[i].attributes.id.nodeValue;
			let material = cells[i].attributes.material.nodeValue;
			let name = id;
			if (cells[i].attributes.name){
				name = cells[i].attributes.name.nodeValue;
			}
			
			let region = cells[i].attributes.region.nodeValue;
			let universe = cells[i].attributes.universe.nodeValue;
			
			//console.log("cell : ", id, " material : ", material, "name : ", name, " region : ", region, "universe : ", universe);
			
			if (region.includes("~")){
				let parsed_cell = new cell(id, material, name, region, universe);
				parsed_cell.splits_region_into_surfaces();
				parsed_cell.is_complex = true;
				parsed_cell.update_nb_points_to_try();
				this.cell_array.push(parsed_cell);

			} else if (region.includes(") | (")){
				let or_regions = region.split(") | (");
			
				for (let j = 0; j < or_regions.length; j++){
					let local_region = or_regions[j].replace('(', '');
					local_region = local_region.replace(')', '');
					//console.log(local_region);
					let parsed_cell = new cell(id, material, name, local_region, universe);
					parsed_cell.splits_region_into_surfaces();
					this.cell_array.push(parsed_cell);
				}
			} else {
				let parsed_cell = new cell(id, material, name, region, universe);
				parsed_cell.splits_region_into_surfaces();
				this.cell_array.push(parsed_cell);
			}
		}   
		//console.log(this.cell_array);
	}

	parsing_mates(){
		let temp_array = [];
		for (let mycell of openMC_reader.cell_array){
			let id_mate = mycell.material;
			let color_cell = this.mesh_tools.attribute_material_color(mycell.name);
			let obj = {id : id_mate, color : color_cell};
			temp_array.push(obj);
		}
		for (let i = 0; i <  temp_array.length - 1; i++){
			for (let j = i + 1; j <  temp_array.length; j++){
				if (temp_array[j] == temp_array[i]){
					delete temp_array[j];
				}
			}
			 
		}

		this.mate_array = temp_array;

	}



}
