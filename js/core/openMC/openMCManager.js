class openMCManager {
    constructor (mesh_tools, openMC_reader){
        this.mesh_tools = mesh_tools;
        this.openMC_reader = openMC_reader;
        this.z_cut = 0;
        this.group_array = [];
    }

    create_objects_in_the_scene(){
        this.create_objects();
        this.add_points_to_the_scene();

        //let openMC_tests = new openMCTests(this.mesh_tools);
		//openMC_tests.create_sphere_intersection();
		//openMC_tests.create_planes_intersection();
		//openMC_tests.create_sphere_cylinder_intersection();
        //openMC_tests.create_sphere_plane_intersection();
    }


    create_objects(){
        for (let mycell of openMC_reader.cell_array){
            let mate = this.openMC_reader.mate_array.find(mate => mate.id === mycell.material);
            mycell.color = mate.color;
            
            if (mycell.is_complex){
                for (let i = 0; i < mycell.nb_points_to_try; i++){                
                    mycell.update_limits();                
                    this.push_one_point(mycell);
                }                            
            } else{
                /*
                mycell.compute_x_limits(this.openMC_reader.surface_array);
                mycell.compute_y_limits(this.openMC_reader.surface_array);
                mycell.compute_z_limits(this.openMC_reader.surface_array);
                */
               this.create_cell_mesh(mycell);
            }
        }
    }

    create_cell_mesh(mycell){
        let local_surfaces = [];
        let local_signs = [];

        for (let cell_surface of mycell.surfaces_array ){
            let surface = this.openMC_reader.surface_array.find(plane_1 => plane_1.id === cell_surface[0]);
            local_surfaces.push(surface);
            local_signs.push(cell_surface[1]);
        }
        //console.log("local_planes : ", local_planes);
        //console.log("local_signs : ", local_signs);

        let myintersector = new intersector();    

        if (this.are_only_planes_in(local_surfaces)){
            console.log("creating the true mesh of cell n°", mycell.id);
            let points_intersection = myintersector.intersect_planes(local_surfaces, local_signs);            
            const geometry = new ConvexGeometry(points_intersection);
            let material = new THREE.MeshBasicMaterial( { color: mycell.color } );
            const mesh = new THREE.Mesh( geometry, material );
            mesh.name = mycell.id;
            mesh.material.name = mycell.material;
            scene_manager.scene.add(mesh);
       
        } else if (this.are_only_spheres_in(local_surfaces)){
            console.log("creating the true mesh of cell n°", mycell.id);
            let points_intersection = myintersector.intersect_spheres(local_surfaces, local_signs);            
            const geometry = new ConvexGeometry(points_intersection);
            let material = new THREE.MeshBasicMaterial( { color: mycell.color } );
            const mesh = new THREE.Mesh( geometry, material );
            mesh.name = mycell.id;
            mesh.material.name = mycell.material;
            scene_manager.scene.add(mesh);
        }


        

    }

    are_only_planes_in(local_planes){
        //console.log(local_planes);
        let to_return = true;
        for (let plane of local_planes){
            if (plane.type != "x-plane" && plane.type != "y-plane" && plane.type != "z-plane"){
                to_return = false;
            }

        }
        return to_return;
    }
    
    are_only_spheres_in(local_spheres){
        console.log(local_spheres);
        let to_return = true;
        for (let sphere of local_spheres){
            if (sphere.type != "sphere"){
                to_return = false;
            }

        }
        console.log("sphere to_return : ", to_return);
        return to_return;
    }

    push_one_point(mycell){
        let x = Math.random() * (mycell.x_max - mycell.x_min) + mycell.x_min;
        let y = Math.random() * (mycell.y_max - mycell.y_min) + mycell.y_min;;
        //let z = Math.random() * (mycell.z_max - mycell.z_min) + mycell.z_min;;
        let z = this.z_cut;
        let point = new THREE.Vector3( x, y, z);
                
        if (this.point_is_in_cell(point, mycell)){
            mycell.computed_points.push(x, y, z);
            mycell.computed_points_colors.push(mycell.color.r, mycell.color.g, mycell.color.b);
            
            mycell.computed_points_vectors.push(point);
        } 

    }

    point_is_in_cell(point, mycell){
        let is_in_cell = true;
        if (mycell.region.includes("~")){
            is_in_cell = this.convert_to_boolean(mycell.region, point);
            //console.log(is_in_cell);
             
        } else {
            for (let surface_delimiter of mycell.surfaces_array){
            //console.log(this.openMC_reader.surface_array);
            let bounding_surface = this.openMC_reader.surface_array.find(surf => surf.id === surface_delimiter[0]);
            //console.log("bounding surface : ", bounding_surface);
            if (!bounding_surface.includes(point, surface_delimiter[1])){
                is_in_cell = false;
            }
            
            }
        }
        
        return is_in_cell;
    }

    
    convert_to_boolean(region, point){
        console.log("converting to boolean ")
        
        //var unique_surfaces = 
        let line = region.replaceAll("~", " ");
        line = line.replaceAll(")", " ");
        line = line.replaceAll("(", " ");
        line = line.replaceAll("|", " ");
        line = line.replaceAll("-", " ");
        line = line.trim();
        let line_array = line.split(/\s+/);

        let unique_ids_array = [...new Set(line_array)];
        //console.log(unique_ids_array);
        let point_inclusion_array = [];
        for (let surface_id of unique_ids_array){
            let bounding_surface = this.openMC_reader.surface_array.find(surf => surf.id === surface_id);
            let is_inside_surf_1 = false;
            if (bounding_surface.includes(point, -1)){
                is_inside_surf_1 = true;
            } 
            let obj = {id : surface_id, is_inside_surf : is_inside_surf_1} 
            point_inclusion_array.push(obj);
        }

        let line_2 = " " + region + " ";
        
        
        //console.log(line_2);
        for (let inclusion of point_inclusion_array){
            line_2 = line_2.replaceAll("-"+inclusion.id + " ", inclusion.is_inside_surf + " ");
            line_2 = line_2.replaceAll("-"+inclusion.id + ")", inclusion.is_inside_surf + ")");
            line_2 = line_2.replaceAll("(-"+inclusion.id + " ", "("+inclusion.is_inside_surf + " ");
            line_2 = line_2.replaceAll(" " + inclusion.id + " ", " " + !inclusion.is_inside_surf + " ");
            line_2 = line_2.replaceAll(" " + inclusion.id + ")", " " + !inclusion.is_inside_surf + ")");
            line_2 = line_2.replaceAll("(" + inclusion.id + " ", "(" + !inclusion.is_inside_surf + " ");

        }
        line_2 = line_2.replaceAll("|", "||");
        line_2 = line_2.replaceAll("~", "!");
        line_2 = line_2.trim();
        line_2 = line_2.replaceAll(" ", " && ");

        /*        
        if (eval(line_2)){
            console.log("current z :", z);
            console.log(line_2);
        }
        */
       console.log(eval(line_2));
        
        
        return eval(line_2);

    }


    add_points_to_the_scene(){
        let group = new THREE.Group();
        group.name = "group_" + this.group_array.length;
        this.group_array.push(group);

        for (let mycell of openMC_reader.cell_array){
            mycell.generate_mesh();
            //scene_manager.scene.add(mycell.mesh);
            group.add(mycell.mesh);
        }
        scene_manager.scene.add(group);
        
    }



    create_example_points(){   
        /*
        let material = new THREE.MeshBasicMaterial({
            color : this.mesh_tools.getRandomColor(),
            //color : new THREE.Color('skyblue'),
        }); 
        let radius = 50;
        var geometry = new THREE.SphereGeometry(radius, 32, 16 );	
        var mesh = new THREE.Mesh(geometry, material);		
        mesh.position.set(0, 0, 0); 
        
        scene_manager.scene.add(mesh);
        */

        var n = 1000000;
        var geometry = new THREE.BufferGeometry();
        var positions = [];
        var colors = []; 
        var X = 100
        
        for (var i = 0; i < n; i++) {
            let x = Math.random() * X - X/2;
            let y = Math.random() * X - X/2;
            let z = Math.random() * X - X/2;
            positions.push(x, y, z);
            let color = this.mesh_tools.getRandomColor()
            colors.push(color.r, color.g, color.b);
        }

        geometry.setAttribute(
            'position',
            new THREE.Float32BufferAttribute(positions, 3)
          );
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        geometry.computeBoundingSphere();
        
        var material = new THREE.PointsMaterial({
        size: 1,
        vertexColors: THREE.VertexColors
        });
    
        let p = new THREE.Points(geometry, material);
        scene_manager.scene.add(p);
        
    }
    




    remove_points_from_the_scene(){

	}

    add_z_cut_listener(){
        var z_slider = document.getElementById("z_slider");
        z_slider.value = this.z_cut;
        var z_writing_zone = document.getElementById("z_writing_zone");
        let that = this;
        
        z_slider.oninput = function() {
            z_writing_zone.value = this.value;
            that.z_cut = this.value;
            console.log ("The z_cut is now : ", that.z_cut);
        }
        z_writing_zone.oninput = function(){
            z_writing_zone.value = this.value;
            that.z_cut = this.value;
        }            
    }

    

}