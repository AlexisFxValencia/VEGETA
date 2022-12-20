class openMCTests {
    constructor (mesh_tools){
        this.mesh_tools = mesh_tools;
    }



        create_custom_mesh(){
            const geometry = new THREE.BufferGeometry();

            const positions = [
            0,   0, 0,    // v1
            0, 200, 0,   // v2
            0, 200, 200,  // v3
            
            0,   0, 0,    // v1
            0, 0, 200,   // v2
            0, 200, 200,  // v3
            ];
            
            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
            geometry.computeVertexNormals();
            
            const object = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
            //scene.add(object);

            scene_manager.scene.add(object);
        }

        create_custom_mesh_2(){
            var vertices = [        
                0,   0, 0,    // v1
                0, 200, 0,   // v2
                0, 200, 200,  // v3

            ];
            let coords = [10,0,1, 0,50,2, 60,60,3, 70,10,4];
            var holes = [];
            var triangles, mesh;
            var geometry = new THREE.BufferGeometry();
            var material = new THREE.MeshBasicMaterial();

            geometry.vertices = vertices;

            //triangles = THREE.ShapeUtils.triangulateShape( vertices, holes );
            triangles = Earcut.triangulate(coords, null, 3);
            console.log("earcut triangles : ", triangles);

            
            for( var i = 0; i < triangles.length; i++ ){
                geometry.faces.push( new THREE.Face3( triangles[i][0], triangles[i][1], triangles[i][2] ));
            }
            


            mesh = new THREE.Mesh( geometry, material );
            scene_manager.scene.add(mesh);
        }

        create_custom_mesh_3(){
            const geometry = new THREE.BufferGeometry();

            //let vertex = [0,0,0, 50,0,0, 25,25,0, 25,25,60];
            let vertex = [10,0,1, 0,50,2, 60,60,3, 70,10,4, 70,10,50];
            console.log("vertex : ", vertex);
            let triangles = Earcut.triangulate(vertex, null, 3);
            console.log("earcut triangles : ", triangles);

            const positions = [];
            for( let i = 0; i < triangles.length; i++ ){
                positions.push(vertex[3*triangles[i] ]);
                positions.push(vertex[3*triangles[i] + 1]);
                positions.push(vertex[3*triangles[i] + 2]);

            }
            console.log(positions);


            geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( positions, 3 ) );
            geometry.computeVertexNormals();
            
            const object = new THREE.Mesh( geometry, new THREE.MeshNormalMaterial() );
            scene_manager.scene.add(object);
        }

        create_custom_mesh_4(){
            //const points = [10,0,1, 0,50,2, 60,60,3, 70,10,4, 70,10,50];

            const a = new THREE.Vector3( 10,0,1 );
            const b = new THREE.Vector3( 0,50,2);
            const c = new THREE.Vector3( 60,60,3 );
            const d = new THREE.Vector3( 70,10,4 );        
            const e = new THREE.Vector3( 70,10,50 );
            let points = [];
            points.push(a);
            points.push(b);
            points.push(c);
            points.push(d);
            points.push(e);

            const geometry = new ConvexGeometry( points );
            const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            const mesh = new THREE.Mesh( geometry, material );
            scene_manager.scene.add(mesh);
        }



        create_sphere_intersection(){
            let radius_1 = 20;
            let sphere_1 = new sphere(radius_1, 0, 0, 0, this.mesh_tools.getRandomColor());
            sphere_1.generate_points();
            let mesh_1 = sphere_1.generate_mesh();
            //scene_manager.scene.add(mesh_1);
            let sign_sphere_1 = -1;

            let radius_2 = 20;     
            let sphere_2 = new sphere(radius_2, 15, 2, 2, this.mesh_tools.getRandomColor());   
            sphere_2.generate_points();
            let mesh_2 = sphere_2.generate_mesh();
            //scene_manager.scene.add(mesh_2);
            let sign_sphere_2 = -1;
        
            let myintersector = new intersector();        
            let points_intersection = myintersector.intersect_two_spheres( sphere_1, sign_sphere_1, sphere_2, sign_sphere_2);

            const geometry = new ConvexGeometry(points_intersection);
            let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            const mesh = new THREE.Mesh( geometry, material );
            scene_manager.scene.add(mesh);
        }

        create_sphere_plane_intersection(){
            let radius_1 = 20;
            let sphere_1 = new sphere(radius_1, 0, 0, 0, this.mesh_tools.getRandomColor());
            sphere_1.generate_points();
            let mesh_1 = sphere_1.generate_mesh();
            //scene_manager.scene.add(mesh_1);
            let sign_sphere_1 = -1;

            let plane_1 = new plane(1, 0, 0, -5);
            let plane_2 = new plane(0, 1, 0, -5);
            let planes = [plane_1, plane_2];
            let planes_signs = [-1, -1];

            let myintersector = new intersector(); 
            //let points_intersection = myintersector.intersect_sphere_one_plane(sphere_1, plane_1, -1);
            let points_intersection = myintersector.intersect_sphere_planes(sphere_1, planes, planes_signs);
            
            const geometry = new ConvexGeometry(points_intersection);
            let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            const mesh = new THREE.Mesh( geometry, material );
            scene_manager.scene.add(mesh);
        }

        create_planes_intersection(){
            let plane_1 = new plane(1, 0, 0, -5);
            let plane_2 = new plane(0, 1, 0, -5);
            let plane_3 = new plane(1, 0, 0, 5);
            let plane_4 = new plane(0, 1, 0, 5);
            let plane_5 = new plane(0, 0, 1, -5);
            let plane_6 = new plane(0, 0, 1, 5);
            let plane_7 = new plane(2, -2, 0, 0);        
            let plane_8 = new plane(0, 0, 1, -2, 1);
            let planes = [plane_1, plane_2, plane_3, plane_4, plane_5, plane_6, plane_7, plane_8];
            let planes_signs = [-1, -1, 1, 1, -1, 1, -1, 1];
            
            let myintersector = new intersector();    
            let points_intersection = myintersector.intersect_planes(planes, planes_signs);
        
            const geometry = new ConvexGeometry(points_intersection);
            let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            const mesh = new THREE.Mesh( geometry, material );
            scene_manager.scene.add(mesh);
        }

        create_sphere_cylinder_intersection(){   
            let radius_1 = 25;
            let sphere_1 = new sphere(radius_1, 0, 0, 0, this.mesh_tools.getRandomColor());
            sphere_1.generate_points();
            let sign_sphere_1 = -1;

            let radius_2 = 10;
            let cylinder_2 = new cylinder(radius_2, radius_2, 0, "z");
            let sign_cylinder_2 = -1;

            let myintersector = new intersector();    
            let points_intersection = myintersector.intersect_sphere_one_cylinder(sphere_1, sign_sphere_1, cylinder_2, sign_cylinder_2);

            const geometry = new ConvexGeometry(points_intersection);
            let material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
            const mesh = new THREE.Mesh( geometry, material );
            scene_manager.scene.add(mesh);

        }
    }