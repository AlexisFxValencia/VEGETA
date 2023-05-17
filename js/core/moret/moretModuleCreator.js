class moretModuleCreator {
    constructor(moret_reader, mesh_creator, mesh_tools, group_array){
        this.moret_reader = moret_reader;
        this.mesh_creator = mesh_creator;
        this.mesh_tools = mesh_tools;
        this.group_array = group_array;
        //this.
    }

    create_hole_meshes(){
        if (this.moret_reader.hole_array[0] != undefined){
            console.log("add_holes_first_module");
            for (let hole of this.moret_reader.hole_array){
                this.create_one_hole(hole);
            }
        }
    }
    create_one_hole(hole){
        for (let type of this.moret_reader.type_array){
            if(hole.id_type == type.id && hole.id_modu == type.id_modu){
                let material_moret= new THREE.MeshBasicMaterial( { color: 0xffffff } );
                //On crée la cellule moret
                let mesh_hole = this.mesh_creator.create_one_mesh(type, material_moret);
                // on fixe la position de la cellule moret
                let x_obj, y_obj, z_obj;
                [x_obj, y_obj, z_obj] = this.get_hole_relative_position(hole);
                mesh_hole.position.set(x_obj, y_obj, z_obj);
                
                //on donne un nom à la cellule moret.
                let id_parent_modu = hole.id_modu;
                let id_hole = hole.id;				
                mesh_hole.name = id_parent_modu + " " + id_hole + " hole";
                this.mesh_creator.mesh_array.push(mesh_hole);               
                

                mesh_hole.material.transparent = true;
                mesh_hole.material.opacity = 0;
                mesh_hole.material.needsUpdate = true;

                this.mesh_creator.add_labeled_bsp(mesh_hole, true);

                this.mesh_creator.add_cell_to_its_container(hole, mesh_hole);
            }
        }
        
    }

    intersect_one_hole(hole){
        let name = hole.id_modu + " " + hole.id + " hole";
        console.log(name);
        let mesh_hole = this.mesh_tools.search_object(name, this.group_array);
        
        let vector_son = new THREE.Vector3();
        mesh_hole.getWorldPosition(vector_son);

        let vector_parent = new THREE.Vector3();
        mesh_hole.parent.getWorldPosition(vector_parent);
        vector_parent.sub(mesh_hole.parent.position);
        vector_son.sub(vector_parent);
        let labeled_bsp_son = this.mesh_creator.labeled_bsp_array.find(labeled_bsp => labeled_bsp.name === name && labeled_bsp.is_hole === true)
		if (labeled_bsp_son != undefined && mesh_hole != undefined){
            this.mesh_tools.container_bsp_substraction(vector_son, mesh_hole.parent, labeled_bsp_son.bsp);
        }
    
        
        
    }
    
   

    
    get_hole_relative_position(hole){
        //console.log("hole", hole);
        let x_obj = hole.x;
        let y_obj = hole.y;
        let z_obj = hole.z;
        let x_cont = 0;
        let y_cont = 0;
        let z_cont = 0;	
        let id_cont = hole.id_cont;
    
    
        if (id_cont == 0){ //correctif pour les id_modules à 0 pour des volumes dans d'autres modules que le n°0 (convention d'écriture).
            id_cont = hole.id_modu;
        }
    
        
        let col_id_hole = this.moret_reader.hole_array.map(function(value,index1) { return value.id; });
        let col_id_volu = this.moret_reader.volu_array.map(function(value,index1) { return value.id; });
        //console.log("hole_array", this.moret_reader.hole_array);
        //console.log("col_id_hole", col_id_hole);
        if (this.moret_reader.modu_array.includes(id_cont) && id_cont == hole.id_modu){ //on considère qu'un module est à l'origine.
            //console.log("id_cont " + id_cont + " (hole's parent is a module)");
            x_cont = 0;
            y_cont = 0;
            z_cont = 0;
        } else if (col_id_volu.includes(id_cont)){
            //console.log("id_cont " + id_cont + " (hole's parent is a volume)");			
            for (let i = 0; i < col_id_volu.length; i++){ 
                if (this.moret_reader.volu_array[i].id == id_cont && this.moret_reader.volu_array[i].id_modu == hole.id_modu){
                    x_cont = this.moret_reader.volu_array[i].x;
                    y_cont = this.moret_reader.volu_array[i].y;
                    z_cont = this.moret_reader.volu_array[i].z;
                }
            }	
        }	
        return [x_obj - x_cont, y_obj - y_cont, z_obj - z_cont];
    
    
    
    
    
    }
    
    add_module_to_its_hole(hole){
        //for (let hole of this.moret_reader.hole_array){
            let id_modu_contained = hole.id_mate;
            let model_module = this.mesh_tools.search_object(id_modu_contained, this.group_array);
            if (model_module != undefined){
                let cloned_module = model_module.clone(true);
                cloned_module.position.set(0,0,0);
                let name = hole.id_modu + " " + hole.id + " hole";
                let hole_mesh = this.mesh_tools.search_object(name, this.group_array);			
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
            
            mesh.translateX(vector.x);
            mesh.translateY(vector.y);
            mesh.translateZ(vector.z);
    
            //console.log("mesh after translation", mesh);
        }		
    
    }
    
    



    intersect_holes_first_module(hole){
        if (this.moret_reader.hole_array[0] != undefined){
            console.log("intersect_holes_first_module");

            let first_module_holes = this.moret_reader.hole_array.filter(hole => hole.id_modu === this.moret_reader.modu_array[0])
            for (let hole of first_module_holes){
                this.intersect_one_hole(hole);
            }
        }
    }

    intersect_holes_secondary_modules(){
        if (this.moret_reader.hole_array[0] != undefined){
            console.log("intersect_holes_secondary_modules");
            let secondary_modules_holes = this.moret_reader.hole_array.filter(hole => hole.id_modu != this.moret_reader.modu_array[0])
            for (let hole of secondary_modules_holes){
                this.intersect_one_hole(hole);
            }
        }
    }



    add_module_to_its_hole_first_module(){	
        if (this.moret_reader.hole_array[0] != undefined){
            console.log("add_module_to_its_hole_first_module");    
            for (let hole of this.moret_reader.hole_array){
                if (hole.id_modu == this.moret_reader.modu_array[0]){
                    this.add_module_to_its_hole(hole);
                }		
            }           
        }
    }

    add_module_to_its_hole_secondary_modules(){
        if (this.moret_reader.hole_array[0] != undefined){
            console.log("add_module_to_its_hole_secondary_modules");
            for (let hole of this.moret_reader.hole_array){
                if (hole.id_modu != this.moret_reader.modu_array[0]){
                    this.add_module_to_its_hole(hole);
                }		
            }
        }
    }

}