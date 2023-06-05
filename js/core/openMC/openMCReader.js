
class openMCReader{
	constructor(){
		this.mesh_tools = new meshTools();
		this.surface_array = [];
		this.cell_array = [];
		this.mate_array = [];
		this.infinity = 10;		
		this.id_type = 1000;
		this.id_volu = 1;
	}

	parsing_xml(text_xml){
		console.log("XML parsing...");
		let parser = new DOMParser();
		let xml = parser.parseFromString(text_xml,"text/xml");
		//console.log(xml);
		this.parse_surfaces(xml);
		this.parse_cells(xml);
		this.parsing_mates();
	}

	parse_surfaces(xml){
		let surfaces = xml.getElementsByTagName("surface");		
		for (let i = 0; i < surfaces.length; i++) {  
			let id = surfaces[i].attributes.id.nodeValue;
			let type = surfaces[i].attributes.type.nodeValue;
			let coeff_list = surfaces[i].attributes.coeffs.nodeValue.split(' ');
			
			
			let coeff = parseFloat(coeff_list[0]);
			if (type == "plane"){
				let a = 1.0;
				let b = 0.0;
				let c = 0.0;
				let d = 0.0;
				switch (coeff_list.length){
					case 1:
						console.log("Syntax problem in the input file !");
						break;
					case 2 : 
						a = parseFloat(coeff_list[0]);
						b = parseFloat(coeff_list[1]);
						break;
					case 3 : 
						a = parseFloat(coeff_list[0]);
						b = parseFloat(coeff_list[1]);
						c = parseFloat(coeff_list[2]);
						break;
					case 4 : 
						a = parseFloat(coeff_list[0]);
						b = parseFloat(coeff_list[1]);
						c = parseFloat(coeff_list[2]);
						d = parseFloat(coeff_list[3]);
						break;
				}
				let plane_1 = new plane(a, b, c, d);
				plane_1.id = id;
				plane_1.type = type;
				this.surface_array.push(plane_1);	
				console.log("plane_1", plane_1);
			} else if (type == "x-plane"){
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
			
				
			if (type == "sphere"){
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

			if (type == 'x-cylinder'){
				let y_center = parseFloat(coeff_list[0]);
				let z_center = parseFloat(coeff_list[1]);
				let radius = parseFloat(coeff_list[2]);
				let cylinder_1 = new cylinder(radius, 0.0, y_center, z_center, "x-cylinder");
				cylinder_1.id = id;
				this.surface_array.push(cylinder_1);
			};
			if (type == 'y-cylinder'){
				let x_center = parseFloat(coeff_list[0]);
				let z_center = parseFloat(coeff_list[1]);
				let radius = parseFloat(coeff_list[2]);
				let cylinder_1 = new cylinder(radius, x_center, 0.0, z_center, "y-cylinder");
				cylinder_1.id = id;
				this.surface_array.push(cylinder_1);
			};
			if (type == 'z-cylinder'){
				let x_center = parseFloat(coeff_list[0]);
				let y_center = parseFloat(coeff_list[1]);
				let radius = parseFloat(coeff_list[2]);
				let cylinder_1 = new cylinder(radius, x_center, y_center, 0.0, "z-cylinder");
				cylinder_1.id = id;
				this.surface_array.push(cylinder_1);
			};
			

		}

		console.log("this.surface_array", this.surface_array);	
	}


	parse_cells(xml){
		let cells = xml.getElementsByTagName("cell");
		for (let i = 0; i < cells.length; i++) {   
			let id = cells[i].attributes.id.nodeValue;
			let material = cells[i].attributes.material.nodeValue;
			let name = id;
			if (cells[i].attributes.name){
				name = cells[i].attributes.name.nodeValue;
			}
			
			let region = cells[i].attributes.region.nodeValue;
			let universe;
			if (cells[i].attributes.universe != undefined){
				universe = cells[i].attributes.universe.nodeValue;
			} else{
				universe = 1;
			}
			
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
		console.log("this.cell_array", this.cell_array);
	}

	parsing_mates(){
		let temp_array = [];
		for (let mycell of this.cell_array){
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

	to_moret(){		
		let text = "GEOM \n";
		text+= "MODU 0 \n";
		
		for (let mycell of this.cell_array){
			let local_surfaces = [];
			for (let cell_surface of mycell.surfaces_array ){				
				let surface = this.surface_array.find(surface_1 => surface_1.id === cell_surface[0]);
				surface.temp_sign = cell_surface[1];	
				local_surfaces.push(surface);			
			}
			if (this.are_only_planes_in(local_surfaces)){
				let moret_text = this.concat_box(local_surfaces, mycell);
				text+= moret_text;
			} else if (this.are_only_z_planes_and_z_cylinders_in(local_surfaces)){   
				let moret_text = this.concat_cylinder(local_surfaces, mycell);
				text+= moret_text;
			}
		}
		//text+= "TYPE 1 SPHE 3 \n";
		//text+= "VOLU 100 0 1 EAU 0 0 0 \n";
		text+= "ENDM \n";
		text+= "ENDG \n";
		return text;
	}


	are_only_planes_in(local_surfaces){
        let to_return = true;
        for (let plane of local_surfaces){
            if (plane.type != "x-plane" && plane.type != "y-plane" && plane.type != "z-plane"){
                to_return = false;
            }

        }
        return to_return;
    }

	are_only_z_planes_and_z_cylinders_in(local_surfaces){
        let to_return = true;
        for (let surface of local_surfaces){
            if (surface.type != "z-plane" && surface.type != "z-cylinder"){
                to_return = false;
            }

        }
        return to_return;
    }

    z_cylinders_have_same_center(local_surfaces){
        let cylinders = local_surfaces.filter(surface => surface.type == "z-cylinder");
        let x_center = cylinders[0].x_center;
        let y_center = cylinders[0].y_center;
        for (let cylinder of cylinders){
            if (cylinder.x_center != x_center || cylinder.y_center != y_center){
                return false;
            } 
        }
        return true;

    }

	concat_box(local_surfaces, mycell){		
		let text = " ";
		let x_min = -this.infinity;
		let x_max = this.infinity;
		let y_min = -this.infinity;
		let y_max = this.infinity;
		let z_min = -this.infinity;
		let z_max = this.infinity;
		for (plane of local_surfaces){
			console.log("plane :", plane);
			let coeff = -plane.d;
			console.log("coeff : ", coeff);
			if (plane.temp_sign == 1){
				if (plane.type == "x-plane" && coeff > x_min){
					x_min = coeff;
				} else if (plane.type == "y-plane" && coeff > y_min){
					y_min = coeff;
				} else if (plane.type == "z-plane" && coeff > z_min){
					z_min = coeff;
				} 
			} else {
				if ((plane.type == "x-plane") && (coeff < x_max)){							
					x_max = coeff;
				} else if (plane.type == "y-plane" && coeff < y_max){
					y_max = coeff;
				} else if (plane.type == "z-plane" && coeff < z_max){
					z_max = coeff;
				} 
			}
			
			
		}
		console.log("x_min :", x_min);
		console.log("x_max : ", x_max);
		let dx = (x_max - x_min)/2;
		let dy = (y_max - y_min)/2;
		let dz = (z_max - z_min)/2;
		let x = (x_min + x_max)/2;
		let y = (y_min + y_max)/2;
		let z = (z_min + z_max)/2;
				
		//let id_volu = mycell.id;
		let id_mate = mycell.material;
		text+= "TYPE " + this.id_type + " BOX " + dx + " " + dy + " " + dz + " \n";
		text+= "VOLU " + this.id_volu + " 0 " + this.id_type + " " + id_mate + " " + x + " " + y + " " + z + " \n";
		this.id_type++; 
		this.id_volu++;
		return text;
	}

	concat_cylinder(local_surfaces, mycell){		
		let text = "";
		let z_min = -this.infinity;
        let z_max = this.infinity;
		let half_height;
		let r;
		let x;
		let y;
		let z;
		
        for (let surface of local_surfaces){
			
            if (surface.type === "z-plane"){
                if (surface.temp_sign == 1){
                    z_min = -surface.d;
                }else{
                    z_max = -surface.d;
                }
            } else if (surface.type === "z-cylinder"){                
                r = surface.radius;
                x = surface.x_center;
				y = surface.y_center;	
            }   
			half_height = (z_max - z_min);
			z = (z_min + z_max)/2;      
        } 

		let id_mate = mycell.material;
		//console.log("local_surfaces", local_surfaces);
		text+= "TYPE " + this.id_type + " CYLZ " + r + " " + half_height + " \n";
		text+= "VOLU " + this.id_volu + " 0 " + this.id_type + " " + id_mate + " " + x + " " + y + " " + z + " \n";
		this.id_type++; 
		this.id_volu++;

       
        return text;
	}
}
