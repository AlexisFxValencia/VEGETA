
class moretManager {
    constructor(scene_manager, moret_reader, cut_manager) {
		this.scene_manager = scene_manager;
		this.modu_array = moret_reader.modu_array;
		this.group_array = [];
		this.fill_group_array();
		let mesh_tools = new meshTools();
		this.mesh_creator = new moretMeshCreator(moret_reader, mesh_tools, cut_manager, this.group_array);
		this.lattice_creator = new moretLatticeCreator(moret_reader, this.mesh_creator, mesh_tools, cut_manager, this.group_array);
		this.mesh_transformer = new moretMeshTransformer(moret_reader, this.mesh_creator, this.lattice_creator, mesh_tools, this.group_array);
		this.module_creator = new moretModuleCreator(moret_reader, this.mesh_creator, mesh_tools, this.group_array);
	}

	//MESHES CREATION
	create_objects_in_the_scene(){
		console.log("Creation of objects in the scene");
		this.mesh_creator.create_meshes();
		this.mesh_creator.position_PLA();		
		this.mesh_creator.position_MPLA();			
		this.module_creator.create_hole_meshes();			
		this.mesh_transformer.intersect_etsu();
		this.mesh_transformer.intersect_supe();
		this.mesh_transformer.intersect_inte();
		
		this.mesh_transformer.intersect_parents();
		this.mesh_transformer.update_geometries();

		

		// SECONDARY MODULES CREATION (lattices included)		
		this.lattice_creator.create_lattices_secondary_modules();
		this.mesh_transformer.intersect_parents_lattice_secondary_modules();
		
		this.lattice_creator.create_lattices_secondary_modules_hex();
		this.lattice_creator.remove_first_mpri_cell_secondary_modules();	
		this.lattice_creator.remove_first_msec_cell_secondary_modules();	
		
		this.module_creator.intersect_holes_secondary_modules();
		this.module_creator.add_module_to_its_hole_secondary_modules();
		

		//FIRST MODULE CREATION (lattices included)
		this.module_creator.intersect_holes_first_module();
		this.module_creator.add_module_to_its_hole_first_module();		

		this.lattice_creator.create_lattices_first_module();
		this.mesh_transformer.intersect_parents_lattice_first_module();	
		
		this.lattice_creator.create_lattices_first_module_hex();
		this.lattice_creator.remove_first_mpri_cell_first_module();				
		this.lattice_creator.remove_first_msec_cell_first_module();		
			
		
		console.log(this.group_array);
		this.scene_manager.scene.add(this.group_array[0]);
		//scene_manager.scene.add(this.group_array[1]);
		//console.log('\nGRAPH SCENE');
		//scene_manager.getSceneGraph(scene_manager.scene);			
	}

	fill_group_array(){
		for (let i =0; i< this.modu_array.length; i++){
			let group = new THREE.Group();
			group.name = this.modu_array[i];
			this.group_array.push(group);
			//console.log("add group : ", group);
		}
		//console.log("group_array[0])", this.group_array[0]);
		//console.log("group_array", this.group_array);
	}

	
	//MESHES DELETION
	remove_objects_from_scene(){
		for (let group of this.group_array){
			let group_children = group.children;	
			for (let child of group_children){	
				group.removeFromParent(child);
			}
			this.scene_manager.scene.removeFromParent(group);
		}
	}

	reset(moret_reader){	
		this.modu_array = moret_reader.modu_array;
		this.group_array = [];		
		this.fill_group_array();
	}

	
}