
class moretManager {
    constructor(moret_reader, mesh_tools, documentHTML) {
		this.modu_array = moret_reader.modu_array;
		this.document = documentHTML;
		this.group_array = [];
		this.fill_group_array();

		this.mesh_creator = new moretMeshCreator(mesh_tools);
		this.lattice_creator = new moretLatticeCreator(this.mesh_creator, mesh_tools);
		this.mesh_transformer = new moretMeshTransformer(this.mesh_creator, mesh_tools);
		this.module_creator = new moretModuleCreator(this.mesh_creator, mesh_tools);
	}

	//MESHES CREATION
	create_objects_in_the_scene(){
		console.log("create object in the scene");
		this.mesh_creator.create_meshes();
		this.mesh_creator.position_PLA();		
		this.mesh_creator.position_MPLA();	
		this.mesh_transformer.rotate_moret_cells();
		this.mesh_transformer.intersect_etsu();
		this.mesh_transformer.intersect_supe();
		this.mesh_transformer.intersect_inte();
		
		this.mesh_transformer.intersect_parents();

		

		// SECONDARY MODULES CREATION (lattices included)		
		this.lattice_creator.intersect_parents_lattice_secondary_modules();
		this.lattice_creator.create_lattices_secondary_modules();
		
		this.lattice_creator.create_lattices_secondary_modules_hex();
		this.lattice_creator.remove_first_mpri_cell_secondary_modules();	
		this.lattice_creator.remove_first_msec_cell_secondary_modules();	
		this.module_creator.add_holes_and_intersect_secondary_modules();
		this.module_creator.add_module_to_its_hole_secondary_modules();
		

		//FIRST MODULE CREATION (lattices included)
		this.module_creator.add_holes_and_intersect_first_module();
		this.module_creator.add_module_to_its_hole_first_module();
		this.lattice_creator.intersect_parents_lattice_first_module();		
		this.lattice_creator.create_lattices_first_module();
		
		this.lattice_creator.create_lattices_first_module_hex();
		this.lattice_creator.remove_first_mpri_cell_first_module();				
		this.lattice_creator.remove_first_msec_cell_first_module();		
			
		
		scene_manager.scene.add(this.group_array[0]);
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
			scene_manager.scene.removeFromParent(group);
		}
	}

	reset(moret_reader){	
		this.modu_array = moret_reader.modu_array;
		this.group_array = [];		
		this.fill_group_array();
	}

	
}