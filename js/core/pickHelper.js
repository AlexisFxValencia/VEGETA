
class PickHelper {

    constructor() {
      this.raycaster = new THREE.Raycaster();
      this.intersection = null;
      this.pickedObject = null;
      this.pickedObjectSavedColor = 0;
    }

    pick(x_position, y_position, scene, camera) {
      var normalizedPosition = {x : x_position, y : y_position };
      // restore the color if there is a new picked object      
      if (this.pickedObject) {
        this.restore_unpicked_mesh_color();
      }
      // cast a ray through the frustum
      this.raycaster.setFromCamera(normalizedPosition, camera);
      const intersectedObjects = this.raycaster.intersectObjects(scene.children);
      
      if (intersectedObjects.length) {
        // the first intersection in intersctedObjects is the closest to the camera.
        for (let intersection of intersectedObjects){
          if (intersection.object.material.transparent == false){
            this.pickedObject = intersection.object;
            this.intersection = intersection;
            this.pickedObjectSavedColor = this.pickedObject.material.color.getHex();
            this.pickedObject.material.color.setHex(0xFF0000); //set object in red          
            break;
          }
        }
      }
    }

    restore_unpicked_mesh_color(){      
      this.pickedObject.material.color.setHex(this.pickedObjectSavedColor);        
      this.pickedObject = undefined;
      this.intersection = undefined;    
    }

    display_picked_object_data(scene){
      this.display_object_name_in_the_scene(scene);    
      this.display_object_name_in_title();            
      this.display_cursor();
    }
    
    display_cursor(){
      if (this.intersection != undefined){
        var x_cursor = document.getElementById("x_cursor");
        var y_cursor = document.getElementById("y_cursor");
        var z_cursor = document.getElementById("z_cursor");
        x_cursor.innerHTML = "x_cursor : " + this.intersection.point.x.toFixed(2);
        y_cursor.innerHTML = "y_cursor : " + this.intersection.point.y.toFixed(2);
        z_cursor.innerHTML = "z_cursor : " + this.intersection.point.z.toFixed(2);
      }
      
    }

    display_object_name_in_the_scene(scene){
      if (this.pickedObject != undefined){
        //console.log("Name of the mesh selected :", this.pickedObject.name);

      if (scene.getObjectByName("object_name_displayed")){
        scene.remove(scene.getObjectByName("object_name_displayed"));
      }
      // create a canvas element
      var canvas1 = document.createElement('canvas');
      var context1 = canvas1.getContext('2d');
      context1.font = "Bold 20px Arial";
      context1.fillStyle = "rgba(255,0,0,0.95)";
      let text = this.pickedObject.name
      context1.fillText(text, 100, 50);
      //context1.fillText(text, 100, 50);

      // canvas contents will be used for a texture
      var texture1 = new THREE.Texture(canvas1) 
      texture1.needsUpdate = true;
          
      var material1 = new THREE.MeshBasicMaterial( {map: texture1, side:THREE.DoubleSide } );
      material1.transparent = true;

      let mesh1 = new THREE.Mesh(
          new THREE.PlaneGeometry(canvas1.width, canvas1.height),
          material1
        );
      mesh1.name = "object_name_displayed";
      //mesh1.position.set(0,50,10);
      //mesh1.position.set(intersection.point.x,intersection.point.y, intersection.point.z);
      mesh1.position.set(-100,30,this.intersection.point.z);
      scene.add( mesh1 );
      
      //console.log("mesh1", mesh1);
      }
      
    }

    display_object_name_in_title(){
      if (this.pickedObject != undefined){
        var jdd_title = document.getElementById("jdd_title");
        jdd_title.innerHTML= "Name of the highlighted volume : " + this.pickedObject.name + "\t - Its composition is : " + this.pickedObject.material.name;
      }
    }

    set_picked_object_transparent(){      
        this.pickedObject.material.transparent = true;
        this.pickedObject.material.opacity = 0;
        this.pickedObject.material.needsUpdate = true;
        //this.pickedObject = null;
        //this.intersection = null;

        let checkboxes = document.getElementsByClassName("transparent_mesh_button");
				//console.log(checkboxes);
        //console.log(this.pickedObject);
        //console.log(this.pickedObject.name);

				for(var i = 0; i < checkboxes.length; i++) {
          if (checkboxes[i].label == "transparent_mesh_button_" + this.pickedObject.name){
            checkboxes[i].checked = true;
          }
					    
				}
    }
  }