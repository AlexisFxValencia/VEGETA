class serpentManager {
    constructor (scene_manager, serpent_reader){
        this.scene_manager = scene_manager;
        this.surf_array = serpent_reader.surf_array;
        this.universe_array = serpent_reader.universe_array;
        this.group_array = [];
        this.mesh_creator = new serpentMeshCreator(serpent_reader, this.group_array);
    }

    
    create_objects_in_the_scene(){    
        this.fill_group_array();  

        for (let group of this.group_array){
            this.mesh_creator.create_cells_of_the_universe(group.name);
            this.mesh_creator.create_filled_cells_of_the_universe(group.name);
            this.scene_manager.scene.add(group);
        }
        
        
        this.mesh_creator.create_pins_of_the_universe();
        this.mesh_creator.intersect_pins();
        this.mesh_creator.create_circular_lattices();
        this.mesh_creator.create_cartesian_lattices();

        /*
        for (let group of this.group_array){
            if (group.name != "0"){
                this.mesh_creator.intersect_universe(groupe.name);
            }
        }
        */
        
        this.mesh_creator.intersect_universe("reactor");
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