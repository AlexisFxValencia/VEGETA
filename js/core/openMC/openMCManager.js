class openMCManager {
    constructor (scene_manager, openMC_reader){
        this.scene_manager = scene_manager;        
        this.openMC_reader = openMC_reader;        
        this.group_array = [];
        let group = new THREE.Group();
        group.name = "groupe_principal";
        this.group_array.push(group);
        this.mesh_creator = new openMCMeshCreator(scene_manager, openMC_reader, this.group_array);
        
    }

    create_objects_in_the_scene(){
        this.mesh_creator.create_objects();
        
        //this.mesh_creator.add_points_to_the_scene();

        //let openMC_tests = new openMCTests(this.mesh_tools);
		//openMC_tests.create_sphere_intersection();
		//openMC_tests.create_planes_intersection();
		//openMC_tests.create_sphere_cylinder_intersection();
        //openMC_tests.create_sphere_plane_intersection();

        this.scene_manager.scene.add(this.group_array[0]);
    }



}