class serpentMeshCreator {
    constructor (serpent_reader, group_array){
        this.serpent_reader = serpent_reader;
        this.group_array = group_array;
        this.infinity = 200;
        this.mesh_tools = new meshTools();
        this.mesh_array = [];
    }

    create_cells_of_the_universe(wanted_universe){
        console.log("create_cells_of_the_universe");
        for(let cell of this.serpent_reader.cell_array){
            let cell_universe = cell[0][1];
            if (cell_universe == wanted_universe){
                let mesh = this.create_one_mesh(cell);  
                let group= this.search_group(cell_universe);
                group.add(mesh);
                this.mesh_array.push(mesh);
            }              
        }
    }

    create_filled_cells_of_the_universe(wanted_universe){
        console.log("create_filled_cells_of_the_universe");
        for(let cell of this.serpent_reader.filled_cell_array){
            let cell_universe = cell[0][1];
            if (cell_universe == wanted_universe){
                let mesh = this.create_one_mesh(cell);  
                let group= this.search_group(cell_universe);
                group.add(mesh);
                this.mesh_array.push(mesh);
            }           
        }
    }

    create_pins_of_the_universe(){
        console.log("creating pins of the universe.");
        for(let cell of this.serpent_reader.filled_cell_array){
            let filling_material = cell[0][2];
            //console.log(cell);
            //console.log(filling_material);
            if (this.serpent_reader.pin_name_list.includes(filling_material)){
                console.log("creating pin : ", cell);
                this.create_pins(cell);
            }  else {
                for (let lattice of this.serpent_reader.cartesian_lattice_array){
                    if (lattice[0][0] == filling_material){
                        console.log("creating pin : ", cell);
                        this.create_pins(cell);
                    } 
                }
                for (let lattice of this.serpent_reader.circular_lattice_array){
                    if (lattice[0][0] == filling_material){
                        console.log("creating pin : ", cell);
                        this.create_pins(cell);
                    } 
                }  
            }
                    
        }
    }

    create_pins(cell){
        for (let pin of this.serpent_reader.pin_array){
            this.create_one_pin(pin, cell);        
        }
    }

    create_one_pin(pin, cell){
        let index = 0;
        for (let cylinder of pin){
            if (!isNaN(cylinder[2])){
                let radius = cylinder[2];
                //console.log("rayon", radius);
                let height = this.infinity;
                let geometry= new THREE.CylinderGeometry(radius, radius, height, 32 );	
                //console.log(pin);
                let material = new THREE.MeshBasicMaterial({
                    //color : this.getRandomColor(),
                    color : this.mesh_tools.attribute_material_color(cylinder[1]),
                });
                material.name = cylinder[1];
                //console.log(material.name);
                let mesh = new THREE.Mesh( geometry, material);
                let vector = new THREE.Vector3(0, 0, 1);
                this.mesh_tools.rotate_mesh(mesh, vector);
    
                mesh.position.set(0, 0, 0);  
                mesh.name = cylinder[0] + " " + index;                
                //console.log("mesh : ", mesh);
                if (index == 0){
                    let universe = cell[0][1];
                    let cell_id = cell[0][0];
                    let parent_name = universe + ' ' + cell_id;  
                    let parent = this.search_object(parent_name);
                    this.mesh_tools.geometrical_substraction(parent, mesh);                       
                    parent.add(mesh);

                    
                } else {
                    let parent_name = cylinder[0] + " " + (index - 1);
                    //console.log("parent_name :", parent_name);
                    let parent_mesh = this.search_object(parent_name);
                    //console.log("parent_mesh : ", parent_mesh);
                    parent_mesh.add(mesh);
                }                
                this.mesh_array.push(mesh);
                index++;
                
            }
        }
        //console.log(scene_manager.scene);        
    }


    intersect_universe(intersector_universe){
        let intersector_group = this.search_group(intersector_universe);
        for(let cell of this.serpent_reader.filled_cell_array){
            let cell_universe = cell[0][1];
            let filling_universe = cell[0][2];      
                
            if (filling_universe == intersector_universe){
                let intersected_group = this.search_group(cell_universe);    
                console.log(intersected_group.children[0]);
                //console.log(intersector_group.children[0]);

                for (let child of intersector_group.children){
                    this.mesh_tools.geometrical_substraction(intersected_group.children[0], child);                    
                }
            }


        } 
    }

    create_one_mesh(cell){   
        console.log("creating one mesh, ", cell);
        let first_surface = this.find_first_surface(cell);
        let color_material = this.get_new_color(cell);
        let material = new THREE.MeshBasicMaterial({
            color : color_material,
        });

        material.name = cell[0][2];
        let mesh = this.create_elementary_mesh(first_surface, material);    
        let universe = cell[0][1];
        let cell_id = cell[0][0];
        mesh.name = universe + ' ' + cell_id;    
        this.intersect_other_cells(cell, mesh, first_surface);
        return mesh;        
    }

    intersect_other_cells(cell, mesh, first_surface){
        //console.log("mesh", mesh);
        for (let cell_surface_name of cell[1]){
            if (cell_surface_name.charAt(0)!='-' && cell_surface_name != first_surface){
                //console.log("cell_surface",cell_surface_name);
                let cell_surface = this.search_surface(cell_surface_name);
                let material = new THREE.MeshBasicMaterial({
                    color : this.mesh_tools.getRandomColor(),
                });
                let neighbour_mesh = this.create_elementary_mesh(cell_surface, material);   
                this.mesh_tools.geometrical_substraction(mesh, neighbour_mesh);
            }
        }
    }

    find_first_surface(cell){
        let first_surface;
        for (let cell_surface_name of cell[1]){
            if (cell_surface_name.charAt(0)=='-'){
                let first_inner_surface_name = cell_surface_name.substring(1);
                //console.log("surface_name :", first_inner_surface_name);
                first_surface = this.search_surface(first_inner_surface_name);
                //console.log("first_surface : ", first_surface);               
            }
        }
        if (first_surface == undefined){       
            let first_outer_surface_name = cell[1][0];  
            first_surface = this.search_surface(first_outer_surface_name);
        }
        return first_surface;
    }

    create_surf_meshes(){
        for (let surf of this.serpent_reader.surf_array){           
            let material = new THREE.MeshBasicMaterial({
                color : this.mesh_tools.getRandomColor(),
            });
            let mesh = this.create_elementary_mesh(surf, material);         
            scene_manager.scene.add(mesh);                        
        }
        //console.log(this.mesh_array);
    }


    create_elementary_mesh(surf, material){
        if (surf[1] =="sqc"){
            let x = surf[2];
            let y = surf[3];
            let d = surf[4];
            var geometry = new THREE.BoxGeometry(2*d, 2*d, this.infinity);
            //console.log("geometry", geometry);
            var mesh = new THREE.Mesh( geometry, material);	
            mesh.position.set(x, y, 0); 
            				
        } else if (surf[1] == "cube"){
            let x = surf[2];
            let y = surf[3];
            let z = surf[4];
            let d = surf[5];
            var geometry = new THREE.BoxGeometry(2*d, 2*d, 2*d);
            var mesh = new THREE.Mesh( geometry, material);	
            mesh.position.set(x, y, z); 

        }else if (surf[1] == "cuboid"){
            let x0 = surf[2];
            let x1 = surf[3];
            let y0 = surf[4];
            let y1 = surf[5];
            let z0 = surf[6];
            let z1 = surf[7];
            let dx = x1 - x0;
            let dy = y1 - y0;
            let dz = z1 - z0;
            let mx = (x1 + x0)/2;
            let my = (y1 + y0)/2;
            let mz = (z1 + z0)/2;
            var geometry = new THREE.BoxGeometry(dx, dy, dz);
            var mesh = new THREE.Mesh( geometry, material);	
            mesh.position.set(mx, my, mz); 

        }else if (surf[1] =="sph"){
            let radius = surf[5];
            var geometry = new THREE.SphereGeometry(radius, 32, 16 );	
            var mesh = new THREE.Mesh( geometry, material);		
            mesh.position.set(0, 0, 0); 	
        } else if (surf[1] =="cylz"){
            let x = surf[2];
            let y = surf[3];
            let radius = surf[4];
            let height = this.infinity;            
            var geometry = new THREE.CylinderGeometry(radius, radius, height, 32 );
            var mesh = new THREE.Mesh( geometry, material);		
            let vector = new THREE.Vector3(0, 0, 1);
			this.mesh_tools.rotate_mesh(mesh, vector);
            mesh.position.set(x, y, 0); 	
        } 
        this.mesh_array.push(mesh);
        return mesh;
    }


    
    intersect_pins(){
        for (let pin of this.serpent_reader.pin_array){
            this.intersect_one_pin(pin);         
        }
    }

    intersect_one_pin(pin){
        console.log("starting intersecting a pin");
        for (let index = 1; index < pin.length; index++){
            //console.log("index : ", index);
            let mesh_name = pin[0][0] + " " + index;
            let mesh = this.search_object(mesh_name);
            //console.log(mesh);
            //console.log(mesh.parent);
            if (mesh != undefined){
                console.log("mesh intersecting its parent :", mesh.name);
                this.mesh_tools.container_geometrical_substraction(mesh.parent, mesh);	 
            }
            
        }

    }

    get_new_color(cell){	
		for (let mate of this.serpent_reader.mate_array){
			if (mate[0] == cell[0][2]){
				let color = mate[1];
				//console.log("color of cell found", cell[0][0], mate[0]);
				return color;
			} 
            
		}
        let id_mate = cell[0][2];
        let color = this.mesh_tools.attribute_material_color(id_mate);
        this.serpent_reader.mate_array.push([id_mate, color]);
        return color;
        
        /*
		let color_material = this.mesh_tools.getRandomColor();		
		this.serpent_reader.mate_array.push([id_mate, color_material]);

		return color_material;
        */
        
	}

    search_object(name){		
        let object = scene_manager.scene.getObjectByName(name);
        if (object != undefined){
            return object;
        }
		
		console.log(name, "not found");	
		
	}

    search_surface(surface_name){
        //console.log("searching :", surface_name);
        let surface = this.serpent_reader.surf_array.find(el => el[0] === surface_name);               
         if (surface != undefined){
                return surface;
        } else {
            console.log("Surface not found...");
        }
    }

    search_group(group_name){
        let group = this.group_array.find(el => el.name === group_name);               
         if (group != undefined){
                return group;
        } else {
            console.log("Group " + group_name +" not found...");
        }
    }

    search_pin_in_array(pin_name){
        for (let pin of this.serpent_reader.pin_array){
            this.create_one_pin(pin, cell);        
        }
    }

    create_cartesian_lattices(){
        console.log("create_cartesian_lattices");
        if (this.serpent_reader.cartesian_lattice_array[0] != undefined){
        for (let lattice of this.serpent_reader.cartesian_lattice_array){
            let universe = lattice[0][0];
            let x0 = lattice[0][1];
            let y0 = lattice[0][2];
            let nx = lattice[0][3];
            let ny = lattice[0][4];
            let pitch = lattice[0][5];
            let shift_x = Math.floor(nx/2)*pitch;
            let shift_y = Math.floor(ny/2)*pitch;

            let parent;
            let meshes_to_substract = [];
            
            for (let [y_index, row] of lattice[1].entries()){
                for (let [x_index, pin_name] of row.entries()){
                    if (this.serpent_reader.pin_name_list.includes(pin_name)){
                        let pin_id = pin_name + " " + "0";
                        //console.log("pin_id", pin_id);
                        let model_cell = this.search_object(pin_id);
                        if (model_cell != undefined){
                            parent = model_cell.parent;
                            //console.log("model_cell", model_cell);
                            let cell = model_cell.clone(true);
                            //console.log("cell", cell);
                            //cell.material = model_cell.material.clone();  
                            let x = - shift_x + x_index * pitch ;
                            let y = + shift_y - (y_index) * pitch;
                            cell.position.setX(model_cell.position.x + x);
                            cell.position.setY(model_cell.position.y + y);
    
                            console.log('intersection of : ', model_cell.parent.name, 'by', cell.name);
                            //this.mesh_tools.geometrical_substraction(model_cell.parent, cell);
                            let cylinder = this.serpent_reader.pin_array.find(el => el[0][0] === pin_name);
                            //console.log("cylinder", cylinder);
                            let pin_max_radius = cylinder[0][2];
                            //console.log("pin_max_radius", pin_max_radius);
                            let height = this.infinity;
                            let geometry = new THREE.CylinderGeometry(pin_max_radius, pin_max_radius, height, 32 );
                            let box = new THREE.Mesh( geometry, cell.material);
                            let vector = new THREE.Vector3(0, 0, 1);
                            this.mesh_tools.rotate_mesh(box, vector);                        
                            box.position.setX(cell.position.x);
                            box.position.setY(cell.position.y);
                            meshes_to_substract.push(box);  
    
                            model_cell.parent.add(cell); 
                        }
                        
                    }
                }
                
                
            }
            //this.mesh_tools.geometrical_multiple_substraction(parent, meshes_to_substract);

        }
        
        }
    }

    create_circular_lattices(){
        console.log("create_circular_lattices");
        if (this.serpent_reader.circular_lattice_array[0] != undefined){
        for (let lattice of this.serpent_reader.circular_lattice_array){
            let universe = lattice[0][0];
            let x0 = lattice[0][1];
            let y0 = lattice[0][2];
            let nr = lattice[0][3];

            let parent;
            let meshes_to_substract = [];
            
            for (let ring of lattice[1]){
                
                let ns = ring[0];
                let radius = ring[1];
                let angle = ring[2];
                //console.log("angle", ring,  angle);
                for (let i = 3; i < 3 + ns; i++){
                    if (this.serpent_reader.pin_name_list.includes(ring[i])){
                        let pin_id = ring[i] + " " + "0";
                        //console.log("pin_id", pin_id);
                        let model_cell = this.search_object(pin_id);
                        parent = model_cell.parent;
                        //console.log("model_cell", model_cell);
                        let cell = model_cell.clone(true);
                        //console.log("cell", cell);
                        //cell.material = model_cell.material.clone();  
                        let x = radius * Math.cos((i-3) * 2*Math.PI/ns + angle*Math.PI/180) ;
                        let y =  radius * Math.sin((i-3) * 2*Math.PI/ns + angle*Math.PI/180) ;
                        cell.position.setX(x);
                        cell.position.setY(y);
                        
                        
                        console.log('intersection of : ', model_cell.parent.name, 'by', cell.name);
                        //this.mesh_tools.geometrical_substraction(model_cell.parent, cell);
                        let cylinder = this.serpent_reader.pin_array.find(el => el[0][0] === ring[i]);
                        //console.log("cylinder", cylinder);
                        let pin_max_radius = cylinder[0][2];
                        //console.log("pin_max_radius", pin_max_radius);
                        let height = this.infinity;
                        let geometry = new THREE.CylinderGeometry(pin_max_radius, pin_max_radius, height, 32 );
                        let box = new THREE.Mesh( geometry, cell.material);
                        let vector = new THREE.Vector3(0, 0, 1);
                        this.mesh_tools.rotate_mesh(box, vector);                        
                        box.position.setX(cell.position.x);
                        box.position.setY(cell.position.y);
                        meshes_to_substract.push(box);   

                        model_cell.parent.add(cell);                        
                    }
                    
                }
            }
            this.mesh_tools.geometrical_multiple_substraction(parent, meshes_to_substract);

        }
        
        }
    }


}
   