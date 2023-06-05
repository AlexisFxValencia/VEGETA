class openMCMeshCreator {
    constructor (scene_manager, openMC_reader, group_array){
        this.scene_manager = scene_manager;
        this.openMC_reader = openMC_reader;
        this.mesh_tools = new meshTools();
        this.mesh_array = [];
        this.z_cut = 0;
        this.group_array = group_array;
    }
   
    create_objects(){
        console.log("create_objects");
        for (let mycell of this.openMC_reader.cell_array){
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
        console.log("creating the mesh of the cell n° ", mycell.id);
        let local_surfaces = [];
        for (let cell_surface of mycell.surfaces_array ){
            let surface = this.openMC_reader.surface_array.find(surface_1 => surface_1.id === cell_surface[0]);
            surface.temp_sign = cell_surface[1];
            local_surfaces.push(surface);            
        }     
        let myintersector = new intersector(this.scene_manager);  
        
        if (this.are_only_planes_in(local_surfaces)){
            console.log("only planes in cell n°", mycell.id);
            console.log("local_surfaces : ", local_surfaces);
            let points_intersection = myintersector.compute_plane_intersections(local_surfaces);            
            console.log("points_intersection", points_intersection);
            const geometry = new ConvexGeometry(points_intersection);
            let material = new THREE.MeshBasicMaterial( { color: mycell.color } );
            const mesh = new THREE.Mesh( geometry, material );
            mesh.name = mycell.id;
            mesh.material.name = mycell.material;
            this.mesh_array.push(mesh);
            this.group_array[0].add(mesh);  
        } 
        else{
            console.log("NOT only planes in cell n°", mycell.id);
            let mesh = myintersector.intersect_surfaces(local_surfaces, mycell);            
            this.mesh_array.push(mesh);
            this.group_array[0].add(mesh);  
        }
    }

    are_only_planes_in(local_surfaces){
        let to_return = true;
        for (let plane of local_surfaces){
            if (plane.type != "plane" && plane.type != "x-plane" && plane.type != "y-plane" && plane.type != "z-plane"){
                to_return = false;
            }

        }
        return to_return;
    } 








    add_points_to_the_scene(){
        console.log("add_point_to_the_scene");
        let group = new THREE.Group();
        group.name = "group_" + this.group_array.length;
        this.group_array.push(group);

        for (let mycell of this.openMC_reader.cell_array){
            console.log("mycell.points", mycell.points);
            if (mycell.points == []){
                mycell.generate_points();
            }

            mycell.generate_mesh();
            group.add(mycell.mesh);
        }
        //this.scene_manager.scene.add(group);
        this.group_array[0].add(group);
        
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
        
        //this.scene_manager.scene.add(mesh);
        this.group_array[0].add(mesh);
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
        //this.scene_manager.scene.add(p);
        this.group_array[0].add(p);
        
        
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
   