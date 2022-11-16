class serpentManager {
    constructor (serpent_reader, mesh_array, mesh_tools, documentHTML){
        this.surf_array = serpent_reader.surf_array;
        this.universe_array = serpent_reader.universe_array;
        this.group_array = [];
		this.mesh_array = mesh_array;
        this.smc = new serpentMeshCreator(mesh_tools);
        this.document = documentHTML;
    }

    
    create_objects_in_the_scene(){    
        this.fill_group_array();  

        for (let group of this.group_array){
            this.smc.create_cells_of_the_universe(group.name);
            this.smc.create_filled_cells_of_the_universe(group.name);
            scene_manager.scene.add(group);
        }
        
        
        this.smc.create_pins_of_the_universe();
        this.smc.intersect_pins();
        this.smc.create_circular_lattices();
        this.smc.create_cartesian_lattices();

        /*
        for (let group of this.group_array){
            if (group.name != "0"){
                this.smc.intersect_universe(groupe.name);
            }
        }
        */
        
        this.smc.intersect_universe("reactor");
    }
    




    fill_group_array(){
		for (let i =0; i< this.universe_array.length; i++){
			let group = new THREE.Group();
			group.name = this.universe_array[i];
			this.group_array.push(group);
			//console.log("add group : ", group);
		}
		//console.log("group_array[0])", this.group_array[0]);
		console.log("group_array", this.group_array);
	}

    //MESHES DELETION
	remove_objects_from_scene(){
		for (let group of this.group_array){
			let group_children = group.children;	
			for (let child of group_children){	
				group.removeFromParent(child);
			}
			scene_manager.scene.removeFromParent(group);
		}
	}

	reset(serpent_reader){	
		this.surf_array = serpent_reader.surf_array;
        this.universe_array = serpent_reader.universe_array;
		this.group_array = [];		
		this.fill_group_array();
	}
}