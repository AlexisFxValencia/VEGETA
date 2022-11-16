class moretModuleCreator {
    constructor(mesh_creator, mesh_tools){
        this.mesh_creator = mesh_creator;
        this.mesh_tools = mesh_tools;
    }

    add_holes_and_intersect(hole){
        //for (let hole of moret_reader.hole_array){
            for (let type of moret_reader.type_array){
                if(hole[2] == type[0] && hole[7] == type[5]){
                    let material_moret= new THREE.MeshBasicMaterial( { color: 0xffffff } );
                    //On crée la cellule moret
                    let moret_hole_cell = this.mesh_creator.create_one_mesh(type, material_moret);
                    // on fixe la position de la cellule moret
                    let x_obj, y_obj, z_obj;
                    [x_obj, y_obj, z_obj] = this.get_hole_relative_position(hole);
                    moret_hole_cell.position.set(x_obj, y_obj, z_obj);
                    
                    //on donne un nom à la cellule moret.
                    let id_parent_modu = hole[7];
                    let id_hole = hole[0];				
                    moret_hole_cell.name = id_parent_modu + " " + id_hole;
                    mesh_array.push(moret_hole_cell);
                    
                    moret_hole_cell.material.transparent = true;
                    moret_hole_cell.material.opacity = 0;
                    moret_hole_cell.material.needsUpdate = true;
    
                    this.mesh_creator.add_cell_to_its_container(hole, moret_hole_cell);
                    //this.mesh_creator.geometrical_substraction(moret_hole_cell.parent, moret_hole_cell);					
                    this.mesh_tools.container_geometrical_substraction(moret_hole_cell.parent, moret_hole_cell);					
                }
            }
        //}
    }
    
    
    get_hole_relative_position(hole){
        //console.log("hole", hole);
        let x_obj = hole[4];
        let y_obj = hole[5];
        let z_obj = hole[6];
        let x_cont = 0;
        let y_cont = 0;
        let z_cont = 0;	
        let id_cont = hole[1];
    
    
        if (id_cont == 0){ //correctif pour les id_modules à 0 pour des volumes dans d'autres modules que le n°0 (convention d'écriture).
            id_cont = hole[7];
        }
    
        
        let col_id_hole = moret_reader.hole_array.map(function(value,index1) { return value[0]; });
        let col_id_volu = moret_reader.volu_array.map(function(value,index1) { return value[0]; });
        //console.log("hole_array", moret_reader.hole_array);
        //console.log("col_id_hole", col_id_hole);
        if (moret_reader.modu_array.includes(id_cont) && id_cont == hole[7]){ //on considère qu'un module est à l'origine.
            //console.log("id_cont " + id_cont + " (hole's parent is a module)");
            x_cont = 0;
            y_cont = 0;
            z_cont = 0;
        } else if (col_id_volu.includes(id_cont)){
            //console.log("id_cont " + id_cont + " (hole's parent is a volume)");			
            for (let i = 0; i < col_id_volu.length; i++){ 
                if (moret_reader.volu_array[i][0] == id_cont && moret_reader.volu_array[i][7] == hole[7]){
                    x_cont = moret_reader.volu_array[i][4];
                    y_cont = moret_reader.volu_array[i][5];
                    z_cont = moret_reader.volu_array[i][6];
                }
            }	
        }	
        return [x_obj - x_cont, y_obj - y_cont, z_obj - z_cont];
    
    
    
    
    
    }
    
    add_module_to_its_hole(hole){
        //for (let hole of moret_reader.hole_array){
            let id_modu_contained = hole[3];
            let model_module = this.mesh_tools.search_object(id_modu_contained, moret_manager);
            if (model_module != undefined){
                let cloned_module = model_module.clone(true);
                cloned_module.position.set(0,0,0);
                let id_parent_modu = hole[7];
                let id_hole = hole[0];	
                let hole_mesh = this.mesh_tools.search_object(id_parent_modu + " " + id_hole, moret_manager);			
                let vector2 = new THREE.Vector3();
                hole_mesh.getWorldPosition(vector2);
                hole_mesh.add(cloned_module);
                cloned_module.position.set(0,0,0);
                this.reposition_group_children(cloned_module);	
            }
        //}
    }
    
    
    reposition_group_children(group){
        console.log("reposition_group_children");
        //console.log("group", group);
        let group_position = new THREE.Vector3();
        group.getWorldPosition(group_position);		
        //console.log(" group position", group_position);
        for (let mesh of group.children){
            let mesh_position = new THREE.Vector3();
            mesh.getWorldPosition(mesh_position);
            //console.log(" mesh_position", mesh_position);
    
            //let vector = mesh_position.sub(group_position);
            let vector = group_position.sub(mesh_position);
            /*
            console.log("vector",vector);
            console.log("mesh before translation", mesh);
            console.log("vector.x", vector.x);
            */
            
            mesh.translateX(vector.x);
            mesh.translateY(vector.y);
            mesh.translateZ(vector.z);
    
            //console.log("mesh after translation", mesh);
        }		
    
    }
    
    
    add_holes_and_intersect_first_module(){
        if (moret_reader.hole_array[0] != undefined){
            console.log("add_holes_and_intersect_first_module");
            for (let hole of moret_reader.hole_array){
                if (hole[7] == moret_reader.modu_array[0]){
                    //console.log("this hole is added to the first module :", hole);
                    this.add_holes_and_intersect(hole);
                }		
            }
        }
    }

    add_holes_and_intersect_secondary_modules(){
        if (moret_reader.hole_array[0] != undefined){
            console.log("add_holes_and_intersect_first_module");
            for (let hole of moret_reader.hole_array){
                if (hole[7] != moret_reader.modu_array[0]){
                    this.add_holes_and_intersect(hole);
                }		
            }
        }
    }

    add_module_to_its_hole_first_module(){	
        if (moret_reader.hole_array[0] != undefined){
            console.log("add_module_to_its_hole_first_module");
            for (let hole of moret_reader.hole_array){
                if (hole[7] == moret_reader.modu_array[0]){
                    this.add_module_to_its_hole(hole);
                }		
            }	
        }
    }

    add_module_to_its_hole_secondary_modules(){
        if (moret_reader.hole_array[0] != undefined){
            console.log("add_module_to_its_hole_secondary_modules");
            for (let hole of moret_reader.hole_array){
                if (hole[7] != moret_reader.modu_array[0]){
                    this.add_module_to_its_hole(hole);
                }		
            }
        }
    }

}