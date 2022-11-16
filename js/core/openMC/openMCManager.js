class openMCManager {
    constructor (mesh_tools, openMC_reader){
        this.mesh_tools = mesh_tools;
        this.openMC_reader = openMC_reader;
        this.z_cut = 0;
        this.group_array = [];
    }

    
    generate_points(){
        for (let mycell of openMC_reader.cell_array){
            let mate = this.openMC_reader.mate_array.find(mate => mate.id === mycell.material);
            mycell.color = mate.color;

            if (!mycell.is_complex){
                mycell.compute_x_limits(this.openMC_reader.surface_array);
                mycell.compute_y_limits(this.openMC_reader.surface_array);
                mycell.compute_z_limits(this.openMC_reader.surface_array);
            }
            
            for (let i = 0; i < mycell.nb_points_to_try; i++){
                if (mycell.is_complex){
                    mycell.update_limits();
                }
                this.push_one_point(mycell);
            }
                
        }
        
    }

    

    push_one_point(mycell){
        let x = Math.random() * (mycell.x_max - mycell.x_min) + mycell.x_min;
        let y = Math.random() * (mycell.y_max - mycell.y_min) + mycell.y_min;;
        //let z = Math.random() * (mycell.z_max - mycell.z_min) + mycell.z_min;;
        let z = this.z_cut;
                
        if (this.point_is_in_cell(x, y, z, mycell)){
            mycell.computed_points.push(x, y, z);
            mycell.computed_points_colors.push(mycell.color.r, mycell.color.g, mycell.color.b);
            
            let myvector = new THREE.Vector3( x, y, z );
            mycell.computed_points_vectors.push(myvector);
        } 

    }

    point_is_in_cell(x, y, z, mycell){
        let is_in_cell = true;
        if (mycell.region.includes("~")){
            is_in_cell = this.convert_to_boolean(mycell.region, x, y, z);
            console.log(is_in_cell);
             
        } else {
            for (let surface_delimiter of mycell.surfaces_array){
            //console.log(this.openMC_reader.surface_array);
            let bounding_surface = this.openMC_reader.surface_array.find(surf => surf.id === surface_delimiter[0]);
            //console.log("bounding surface : ", bounding_surface);
            if (!bounding_surface.includes(x, y, z, surface_delimiter[1])){
                is_in_cell = false;
            }
            
            }
        }
        
        return is_in_cell;
    }

    
    convert_to_boolean(region, x, y, z){
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
            if (bounding_surface.includes(x, y, z, "-")){
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