class cutManager{
	constructor(scene_manager){
		this.scene_manager = scene_manager;
		this.x_plane;
		this.y_plane;
		this.z_plane;

	}

	set_planes(){
		//console.log("setting cut planes");
		var x_axis = new THREE.Vector3( 1, 0, 0 );
		var y_axis = new THREE.Vector3( 0, 1, 0 );
		var z_axis = new THREE.Vector3( 0, 0, 1 );
		this.x_plane = new THREE.Plane( x_axis, +1000 );
		this.y_plane = new THREE.Plane( y_axis, +1000 );
		this.z_plane = new THREE.Plane( z_axis, +1000 );
		this.scene_manager.renderer.localClippingEnabled = true;
		
	}


	set_planes_position(){
		this.x_plane.constant = - this.scene_manager.bbox.min.x + 1;
		this.y_plane.constant = - this.scene_manager.bbox.min.y + 1;
		this.z_plane.constant = - this.scene_manager.bbox.min.z + 1;
		
		//helper = boite filaire d'aide qui englobe tous les mesh de la scene.
		//let helper = new THREE.Box3Helper(bbox, new THREE.Color(0, 255, 0));
		//scene_manager.scene.add(helper);	
		
		let that = this;

		var x_slider = document.getElementById("x_slider");
		x_slider.max = this.scene_manager.bbox.max.x + 1;
		x_slider.min = this.scene_manager.bbox.min.x - 1;	
		x_slider.value = x_slider.min;
		var x_writing_zone = document.getElementById("x_writing_zone");
		// Update the current slider value (each time you drag the slider handle)
		x_slider.oninput = function() {
			//x_output.innerHTML = this.value;
			x_writing_zone.value = this.value;
			that.x_plane.constant = - this.value;
			that.scene_manager.render();
		}
		x_writing_zone.oninput = function(){
			that.x_plane.constant = - this.value;
			x_slider.value = this.value;
			that.scene_manager.render();
		}

		var y_slider = document.getElementById("y_slider");
		y_slider.max = this.scene_manager.bbox.max.y + 1;
		y_slider.min = this.scene_manager.bbox.min.y - 1;	
		y_slider.value = y_slider.min;
		var y_writing_zone = document.getElementById("y_writing_zone");
		// Update the current slider value (each time you drag the slider handle)
		y_slider.oninput = function() {
			y_writing_zone.value = this.value;
			that.y_plane.constant = - this.value;
			that.scene_manager.render();
		}
		y_writing_zone.oninput = function(){
			that.y_plane.constant = - this.value;
			y_slider.value = this.value;
			that.scene_manager.render();
		}

		var z_slider = document.getElementById("z_slider");
		z_slider.max = this.scene_manager.bbox.max.z + 1;
		z_slider.min = this.scene_manager.bbox.min.z - 1;	
		z_slider.value = z_slider.min;
		var z_writing_zone = document.getElementById("z_writing_zone");
		// Update the current slider value (each time you drag the slider handle)
		z_slider.oninput = function() {
			z_writing_zone.value = this.value;
			that.z_plane.constant = - this.value;
			that.scene_manager.render();
		}
		z_writing_zone.oninput = function(){
			that.z_plane.constant = - this.value;
			z_slider.value = this.value;
			that.scene_manager.render();
		}
	}
}
