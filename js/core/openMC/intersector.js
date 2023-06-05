class intersector{
    constructor(scene_manager){
        this.infinity = 100;
        this.mesh_tools = new meshTools();
        this.scene_manager = scene_manager;
    }

    
    intersect_surfaces(local_surfaces, mycell){
        let bbox = this.generate_container(local_surfaces, mycell);

        let surfs = local_surfaces.filter(surface => surface.type == "sphere" || surface.type == "x-cylinder" || surface.type == "y-cylinder" || surface.type == "z-cylinder");    
        
        this.create_one_mesh_bsp(surfs, mycell.color, bbox);

        let inside_surfs = surfs.filter(surf => surf.temp_sign == -1);
        let outside_surfs = surfs.filter(surf => surf.temp_sign == +1);
        if (inside_surfs != undefined && inside_surfs.length >= 1){
            let ref_bsp = inside_surfs[0].bsp;
            for (let i = 1; i < inside_surfs.length; i++){
                ref_bsp = ref_bsp.intersect(inside_surfs[i].bsp);
            }
            if (outside_surfs != undefined && outside_surfs.length >= 1){
            for (let i = 0; i < outside_surfs.length; i++){
                ref_bsp = ref_bsp.subtract(outside_surfs[i].bsp);
                }
            }
            let mesh = CSG.toMesh(ref_bsp, inside_surfs[0].mesh.matrix, inside_surfs[0].mesh.material);
            mesh.name = mycell.id;
            mesh.material.name = mycell.material;
            return mesh;
        } else{
            let ref_bsp = bbox.bsp;
            if (outside_surfs != undefined && outside_surfs.length >= 1){
                for (let i = 0; i < outside_surfs.length; i++){
                    let son = outside_surfs[i];
                    ref_bsp = ref_bsp.subtract(son.bsp);
                }
            }
            let mesh = CSG.toMesh(ref_bsp, bbox.mesh.matrix, bbox.mesh.material);
            mesh.name = mycell.id;
            mesh.material.name = mycell.material;
            return mesh;
        }
    }

    generate_container(local_surfaces, mycell){
        let xyz_planes = local_surfaces.filter(surface => surface.type == "x-plane" || surface.type == "y-plane" || surface.type == "z-plane");
        let bbox = this.find_cell_bounding_box(xyz_planes);      
        let dx = bbox.max.x - bbox.min.x;
        let dy = bbox.max.y - bbox.min.y;
        let dz = bbox.max.z - bbox.min.z;
        let geometry = new THREE.BoxGeometry(dx, dy, dz);
        let material = new THREE.MeshPhongMaterial({ color: mycell.color, side: THREE.DoubleSide});
        bbox.mesh = new THREE.Mesh(geometry, material);        
        bbox.bsp = CSG.fromMesh(bbox.mesh);
        let x = (bbox.max.x + bbox.min.x)/2;
        let y = (bbox.max.y + bbox.min.y)/2;
        let z = (bbox.max.z + bbox.min.z)/2;
        bbox.bsp.translate(x, y, z);
        bbox.mesh.position.set(x, y, z);

        let other_planes = local_surfaces.filter(surface => surface.type == "plane")
        this.intersect_box_by_planes(bbox, other_planes);
        return bbox;
    }

    find_cell_bounding_box(planes){
        let vector_min = new THREE.Vector3(-this.infinity, -this.infinity, -this.infinity);
        let vector_max = new THREE.Vector3(this.infinity, this.infinity, this.infinity);
        for (let plane of planes){  
            let coeff = -plane.d;          
            if (plane.temp_sign == 1){
                if (plane.type === "x-plane"){
                    vector_min.x = coeff;
                } else if (plane.type === "y-plane"){
                    vector_min.y = coeff;
                } else if (plane.type === "z-plane"){
                    vector_min.z = coeff;
                }
            } else if (plane.temp_sign == -1){
                if (plane.type === "x-plane"){
                    vector_max.x = coeff;
                } else if (plane.type === "y-plane"){
                    vector_max.y = coeff;
                }else if (plane.type === "z-plane"){
                    vector_max.z = coeff;
                }
            }
        }
        let limit_box = new THREE.Box3(vector_min, vector_max);
        return limit_box;

    }

    intersect_box_by_planes(bbox, other_planes){
        if (other_planes != undefined && other_planes.length >= 1) {
            for (plane of other_planes){
                this.intersect_bsp_one_plane(bbox, plane)
            }
        }
    }

    intersect_bsp_one_plane(bbox, plane){        
        let geometry = new THREE.BoxGeometry(10*this.infinity, 10*this.infinity, 10*this.infinity);
        let color = this.mesh_tools.getRandomColor();
        let material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide});
        let plane_mesh = new THREE.Mesh( geometry, material);
        let v_norm = new THREE.Vector3(plane.a, plane.b, plane.c);
        v_norm = v_norm.normalize();
        this.mesh_tools.rotate_mesh(plane_mesh, v_norm);
        let plane_bsp = CSG.fromMesh(plane_mesh);

        let dist_from_origin = - plane.d / Math.sqrt(plane.a*plane.a + plane.b*plane.b + plane.c*plane.c); //minus to translate the plane in the right direction
        let x = dist_from_origin*v_norm.x;
        let y = dist_from_origin*v_norm.y;
        let z = dist_from_origin*v_norm.z;
        plane_bsp.translate(x, y, z);
        
        let d_shift;
        if (plane.temp_sign == +1){
            d_shift = 5.0*this.infinity;
        } else if (plane.temp_sign == -1){    
            d_shift = -5*this.infinity;
        }
        let shift = new THREE.Vector3(d_shift*v_norm.x, d_shift*v_norm.y, d_shift*v_norm.z);
        plane_bsp.translate(shift.x, shift.y, shift.z);
        bbox.bsp = bbox.bsp.intersect(plane_bsp);  
}

    create_one_mesh_bsp(cell_surfaces, color, bbox){
        for (cylinder of cell_surfaces){
            if (cylinder.bsp == undefined){
                let height = 2*this.infinity;
                let cyl_geometry;
                console.log("cylinder.type", cylinder.type);
                switch (cylinder.type){
                    case 'x-cylinder':
                        height = bbox.max.x - bbox.min.x;
                        cyl_geometry = new THREE.CylinderGeometry(cylinder.radius, cylinder.radius, height, 32 );	
                        break;
                    case 'y-cylinder':
                        height = bbox.max.y - bbox.min.y;
                        cyl_geometry = new THREE.CylinderGeometry(cylinder.radius, cylinder.radius, height, 32 );	
                        break;
                    case 'z-cylinder':
                        height = bbox.max.z - bbox.min.z;
                        cyl_geometry = new THREE.CylinderGeometry(cylinder.radius, cylinder.radius, height, 32 );	
                        break;
                    case 'sphere':
                        cyl_geometry = new THREE.SphereGeometry(cylinder.radius, 32, 16 );
                        break;
                }
                let cyl_material = new THREE.MeshPhongMaterial({ color: color, side: THREE.DoubleSide});
                console.log("cyl_material.color", cyl_material.color);
                cylinder.mesh = new THREE.Mesh(cyl_geometry, cyl_material);
                if (cylinder.type == "x-cylinder"){
                    let vector = new THREE.Vector3(1, 0, 0);
                    this.mesh_tools.rotate_mesh(cylinder.mesh, vector);
                } else if (cylinder.type == "z-cylinder"){
                    let vector = new THREE.Vector3(0, 0, 1);
                    this.mesh_tools.rotate_mesh(cylinder.mesh, vector);
                }
                let cylinder_bsp = CSG.fromMesh(cylinder.mesh);
                cylinder_bsp.translate(cylinder.x_center, cylinder.y_center, cylinder.z_center);
                console.log("intersection by bbox.bsp");
                cylinder_bsp = cylinder_bsp.intersect(bbox.bsp);
                
                cylinder.bsp = cylinder_bsp;
            } 
        }
    }

    
    

    planes_include(tested_vector, planes){
        let included = true;
        for (let plane of planes ){
            if (!plane.includes(tested_vector, plane.temp_sign)){
                included = false;
                return included;
            }
        }
        return included
    }


    compute_plane_intersections(planes, planes_signs){
        //console.log(planes);
        let points = [];
        for(let i = 0; i < planes.length -2; i++){
            for(let j = i + 1; j < planes.length -1; j++){
              for(let k = j + 1; k < planes.length; k++){
                 let vector = this.intersect_three_planes(planes[i], planes[j], planes[k]);
                //console.log("vector", vector);
                if (vector != null){
                    //console.log("this.planes_include(vector, planes, planes_signs)", this.planes_include(vector, planes, planes_signs));
                    if (this.planes_include(vector, planes, planes_signs)){                    
                        points.push(vector);
                    }
                }
              }
            }
          }
         // console.log(points);
        return points;
    }

    intersect_three_planes(plane_1, plane_2, plane_3){
        const A = new THREE.Matrix3();
        const B = new THREE.Vector3(- plane_1.d, - plane_2.d, - plane_3.d);
        A.set( plane_1.a, plane_1.b, plane_1.c,
            plane_2.a, plane_2.b, plane_2.c,
            plane_3.a, plane_3.b, plane_3.c,
             );
        if (A.determinant() == 0){
            return null;
        } else{
            A.invert();
            B.applyMatrix3(A);
            
            return B;
        }
    }

    add_missing_planes(all_planes){
        let x_planes = all_planes.filter(surface => surface.type == "x-plane");
        let y_planes = all_planes.filter(surface => surface.type == "y-plane");
        let z_planes = all_planes.filter(surface => surface.type == "z-plane");
        
        if (x_planes== undefined){
            let plane_plus_x = new plane(1, 0, 0, -this.infinity);
            let plane_minus_x = new plane(1, 0, 0, this.infinity);
            all_planes.push(plane_plus_x);
            all_planes.push(plane_minus_x);

        } else if (x_planes.length == 1){
            if (x_planes[0].d >= 0){
                let plane_plus_x = new plane(1, 0, 0, -this.infinity);
                all_planes.push(plane_plus_x);
            } else{
                let plane_minus_x = new plane(1, 0, 0, this.infinity); 
                all_planes.push(plane_minus_x);
            }
        }
        
        if (y_planes== undefined){
            let plane_plus_y = new plane(0, 1, 0, -this.infinity);
            let plane_minus_y = new plane(0, 1, 0, this.infinity);
            all_planes.push(plane_plus_y);
            all_planes.push(plane_minus_y);

        } else if (y_planes.length == 1){
            if (y_planes[0].d >= 0){
                let plane_plus_y = new plane(0, 1, 0, -this.infinity);
                all_planes.push(plane_plus_y);
            } else{
                let plane_minus_y = new plane(0, 1, 0, this.infinity); 
                all_planes.push(plane_minus_y);
            }
        }

        if (z_planes== undefined){
            let plane_plus_z = new plane(0, 0, 1, -this.infinity);
            let plane_minus_z = new plane(0, 0, 1, this.infinity);
            all_planes.push(plane_plus_z);
            all_planes.push(plane_minus_z);

        } else if (z_planes.length == 1){
            if (z_planes[0].d >= 0){
                let plane_plus_z = new plane(0, 0, 1, -this.infinity);
                all_planes.push(plane_plus_z);
            } else{
                let plane_minus_z = new plane(0, 0, 1, this.infinity); 
                all_planes.push(plane_minus_z);
            }
        }

    }

}

