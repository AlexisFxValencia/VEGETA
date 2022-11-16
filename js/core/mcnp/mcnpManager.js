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
    

    /*
    create_objects_in_the_scene(){
    var cube, sphere, mesh_sub, mesh_intersect, mesh_union;
    [cube, sphere, mesh_sub, mesh_intersect, mesh_union]  = this.create_cells();	
    cube.position.set(-5, 0, 0);
    scene_manager.scene.add(cube);
    scene_manager.scene.add(sphere);
    mesh_sub.position.set(0, 5, 0);
    scene_manager.scene.add(mesh_sub);
    mesh_intersect.position.set(5, 5, 0);
    scene_manager.scene.add(mesh_intersect);
    mesh_union.position.set(5, 15, 0);
    scene_manager.scene.add(mesh_union);
    
    let ellipsoid = ellipsoid_z_mesh_creator(5, 8, 12);
    scene_manager.scene.add(ellipsoid);

    let ellipsoid2 = ellipsoid_z_mesh_creator(8, 5, 12);
    scene_manager.scene.add(ellipsoid2);
    scene_manager.render();
    //scene.add(hex_lines);

    let ellipsoid3 = ellipsoid2.clone();
    ellipsoid3.position.x = 50;
    scene_manager.scene.add(ellipsoid3);


    }
    */
    



    create_cells(){	
        console.log("creation d'un cube serpent");
        
        let color_material = getRandomColor();
        let material= new THREE.MeshBasicMaterial( { color: color_material } );
        let cube_geometry = new THREE.BoxGeometry(3, 3, 3);
        let cube_mesh = new THREE.Mesh( cube_geometry, material );

        let color_material_2 = getRandomColor();
        let material_2 = new THREE.MeshBasicMaterial( { color: color_material_2 } );
        let rayon = 3;
        let sphere_geometry= new THREE.SphereGeometry(rayon, 32, 16 );
        let sphere_mesh = new THREE.Mesh( sphere_geometry, material_2 );
        sphere_mesh.position.set(3, 0, 0);
            
        cube_mesh.updateMatrix();
        sphere_mesh.updateMatrix();

        console.log("Create a bsp tree from each of the meshes");
        
        let bsp_cube = CSG.fromMesh( cube_mesh );                        
        let bsp_sphere = CSG.fromMesh( sphere_mesh );
        let bsp_sub = bsp_cube.subtract(bsp_sphere);
        let bsp_intersect = bsp_cube.intersect(bsp_sphere);
        let bsp_union = bsp_cube.union(bsp_sphere);

        //Get the resulting mesh from the result bsp, and assign meshA.material to the resulting mesh
        //cf. https://github.com/manthrax/THREE-CSGMesh
        let mesh_sub = CSG.toMesh( bsp_sub, cube_mesh.matrix, cube_mesh.material );
        let mesh_intersect = CSG.toMesh( bsp_intersect, cube_mesh.matrix, cube_mesh.material );
        let mesh_union = CSG.toMesh(bsp_union, cube_mesh.matrix, cube_mesh.material);

        return [cube_mesh, sphere_mesh, mesh_sub, mesh_intersect, mesh_union];
    }

    refresh(){
        console.log("refresh serpent");
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
}