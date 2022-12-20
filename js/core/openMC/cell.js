
class cell{
        constructor(id, material, name, region, universe){
                this.id = id;
                this.material = material;
                this.name = name;
                this.region = region;
                this.universe = universe;

                this.surfaces_array = [];
                this.dL = 40;
                this.x_min = -this.dL;
                this.x_max = this.dL;
                this.y_min = -this.dL;
                this.y_max = this.dL;
                this.z_min = -this.dL;
                this.z_max = this.dL;

                this.computed_points = [];
                this.computed_points_vectors = [];
                this.computed_points_colors = [];
                this.color;
                this.mesh;
                this.is_complex = false;
                this.doubling_counter = 3;

                this.point_size = 0.1;
                this.coeff = 0.5;

                this.nb_points_to_try = 3000;

        }

        update_nb_points_to_try(){
                if (this.is_complex){
                        this.nb_points_to_try = 120;
                }
                
        }

        generate_mesh(){
                var geometry = new THREE.BufferGeometry();
                geometry.setAttribute(
                'position',
                new THREE.Float32BufferAttribute(this.computed_points, 3)
                );
                geometry.setAttribute('color', new THREE.Float32BufferAttribute(this.computed_points_colors, 3));
                
                geometry.computeBoundingSphere();
                
                var material = new THREE.PointsMaterial({
                size: this.point_size,
                vertexColors: THREE.VertexColors
                });
        
                this.mesh = new THREE.Points(geometry, material);
                this.mesh.name = this.name;
                /*
                const geometry = new ConvexGeometry( this.point_vectors );
                const material = new THREE.MeshBasicMaterial( { color: this.mesh_tools.getRandomColor() } );
                this.mesh = new THREE.Mesh( geometry, material );
                */
        }

        splits_region_into_surfaces(){
                let line = this.region.trim();
                let ids = line.split(/\s+/);
                //console.log(ids);
                for (let i = 0; i < ids.length; i++) {   
                        let surface_id = parseInt(ids[i], 10);
                        
                        if (surface_id < 0){
                                this.surfaces_array.push([ids[i].replace('-', ''), -1]) 
                        } else{
                                this.surfaces_array.push([ids[i].replace('-', ''), +1]) 
                        }
                }
        }

        compute_x_limits(surface_array){
                for (let surface_delimiter of this.surfaces_array){
                        let bounding_surface = surface_array.find(surf => surf.id === surface_delimiter[0]);
                        if (bounding_surface.type == "x-plane"){
                            if (surface_delimiter[1] == -1){
                                        if (bounding_surface.coeff < this.x_max){
                                                this.x_max =  bounding_surface.coeff;
                                        }
                            } else if (surface_delimiter[1] == +1){
                                        if (bounding_surface.coeff > this.x_min){
                                                this.x_min =  bounding_surface.coeff;
                                        }
                                }
                        }
                } 
        }

        compute_y_limits(surface_array){
                for (let surface_delimiter of this.surfaces_array){
                        let bounding_surface = surface_array.find(surf => surf.id === surface_delimiter[0]);
                        if (bounding_surface.type == "y-plane"){
                            if (surface_delimiter[1] == -1){
                                        if (bounding_surface.coeff < this.y_max){
                                                this.y_max =  bounding_surface.coeff;
                                        }
                            } else if (surface_delimiter[1] == +1){
                                        if (bounding_surface.coeff > this.y_min){
                                                this.y_min =  bounding_surface.coeff;
                                        }
                                }
                        }
                } 
        }

        compute_z_limits(surface_array){
                for (let surface_delimiter of this.surfaces_array){
                        let bounding_surface = surface_array.find(surf => surf.id === surface_delimiter[0]);
                        if (bounding_surface.type == "z-plane"){
                            if (surface_delimiter[1] == -1){
                                        if (bounding_surface.coeff < this.z_max){
                                                this.z_max =  bounding_surface.coeff;
                                        }
                            } else if (surface_delimiter[1] == +1){
                                        if (bounding_surface.coeff > this.z_min){
                                                this.z_min =  bounding_surface.coeff;
                                        }
                                }
                        }
                } 
        }

        update_limits(){
                if (this.computed_points_vectors.length > Math.pow(2, this.doubling_counter)){
                        
                        let x_array = this.get_column(this.computed_points_vectors, "x");
                        let y_array = this.get_column(this.computed_points_vectors, "y");
                        let z_array = this.get_column(this.computed_points_vectors, "z");
                        //console.log("z_array", z_array);
                        let temp_x_min = Math.min(...x_array);
                        let temp_x_max = Math.max(...x_array);
                        let temp_y_min = Math.min(...y_array);
                        let temp_y_max = Math.max(...y_array);
                        let temp_z_min = Math.min(...z_array);
                        let temp_z_max = Math.max(...z_array);
                        //console.log(temp_z_min, temp_z_max );

                        let tolerance_x = (temp_x_max - temp_x_min) * (this.coeff);
                        let tolerance_y = (temp_y_max - temp_y_min) * (this.coeff);
                        let tolerance_z = (temp_z_max - temp_z_min) * (this.coeff);
                        this.coeff = this.coeff/2;

                        this.x_min = temp_x_min - tolerance_x;
                        this.x_max = temp_x_max + tolerance_x;
                        this.y_min = temp_y_min - tolerance_y;
                        this.y_max = temp_y_max + tolerance_y;
                        this.z_min = temp_z_min - tolerance_z;
                        this.z_max = temp_z_max + tolerance_z;

                        //console.log(this.x_min, this.x_max );

                        this.doubling_counter++;
                        
                }
        }

        get_column(anArray, coordinate){
            return anArray.map(vect => vect[coordinate]);    
        }

}
