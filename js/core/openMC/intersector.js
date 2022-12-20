class intersector{
    constructor(){

    }

    intersect_two_spheres(sphere_1, sign_sphere_1, sphere_2, sign_sphere_2){
        let points = [];
        for (let point_vector of sphere_1.points){
            if (sphere_2.includes(point_vector, sign_sphere_2)){
                points.push(point_vector);
            }
        }
        for (let point_vector of sphere_2.points){
            if (sphere_1.includes(point_vector, sign_sphere_1)){
                points.push(point_vector);
            }
        }
        console.log("intersected points of two spheres : ", points);
        return points;
    }

    intersect_spheres(spheres, spheres_signs){        
        for (let i = 0; i < spheres.length; i++){
            spheres[i].generate_points();
        }        
        if (spheres.length == 1){
            return spheres[0].points;
        } else{
            let points = [];
            for (let i = 0; i < spheres.length-1; i++){
                for (let j = i+1; j < spheres.length; j++){
                    for (let point_vector of spheres[i].points){
                        let belongs_to_all_spheres = true;
                        if (! spheres[j].includes(point_vector, spheres_signs[j])){
                            belongs_to_all_spheres = false;
                        }
                        if (belongs_to_all_spheres){                        
                            points.push(point_vector);
                        }
                    }
                }
                
            }
            return points;
        }             
    }

    intersect_sphere_one_plane(sphere_1, plane_1, plane_sign){
        let points = [];
        for (let point_vector of sphere_1.points){
            if (plane_1.includes(point_vector, plane_sign)){
                points.push(point_vector);
            }
        }
        console.log("intersected points of a sphere and a plane : ", points);
        return points;
    }

    intersect_sphere_one_cylinder(sphere_1, sign_sphere_1, cylinder_2, sign_cylinder_2){
        let points = [];
        for (let point_vector of sphere_1.points){
            if (cylinder_2.includes(point_vector, sign_cylinder_2)){
                points.push(point_vector);
            }
        }
        console.log("intersected points of a sphere and a cylinder : ", points);
        return points;
    }

    planes_include(tested_vector, planes, planes_signs){
        let included = true;
        for (let i = 0 ; i < planes.length; i++ ){
            //console.log(planes[i], "planes[i].includes(tested_vector, planes_signs[i])", planes[i].includes(tested_vector, planes_signs[i]));
            if (!planes[i].includes(tested_vector, planes_signs[i])){
                included = false;
                return included;
            }
        }
        return included
    }

    intersect_sphere_planes(sphere_1, planes, planes_signs){
        let points = [];
        for (let vector of sphere_1.points){   
            if (this.planes_include(vector, planes, planes_signs)){                    
                points.push(vector);
            }            
        }
        console.log("intersected points of a sphere and multiple planes : ", points);
        return points;
    }

    intersect_planes(planes, planes_signs){
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


    


}