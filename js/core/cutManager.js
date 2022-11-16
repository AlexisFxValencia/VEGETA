var x_plane, y_plane, z_plane;
var minx;
var maxx;
var bbox_max_z;
var bbox_min_y;

function set_planes(){
	//console.log("setting cut planes");
	var x_axis = new THREE.Vector3( 1, 0, 0 );
	var y_axis = new THREE.Vector3( 0, 1, 0 );
	var z_axis = new THREE.Vector3( 0, 0, 1 );
	x_plane = new THREE.Plane( x_axis, +1000 );
	y_plane = new THREE.Plane( y_axis, +1000 );
	z_plane = new THREE.Plane( z_axis, +1000 );
	scene_manager.renderer.localClippingEnabled = true;
	
}


function set_planes_position(moret_manager){
	let bbox = new THREE.Box3().setFromObject(moret_manager.group_array[0]);	
	bbox_max_z = bbox.max.z;
	bbox_min_y = bbox.min.y;

	x_plane.constant = - bbox.min.x + 1;
	y_plane.constant = - bbox.min.y + 1;
	z_plane.constant = - bbox.min.z + 1;
	
	//helper = boite filaire d'aide qui englobe tous les mesh de la scene.
	//let helper = new THREE.Box3Helper(bbox, new THREE.Color(0, 255, 0));
	//scene_manager.scene.add(helper);	
	
	var x_slider = document.getElementById("x_slider");
	x_slider.max = bbox.max.x + 1;
	x_slider.min = bbox.min.x - 1;	
	x_slider.value = x_slider.min;
	var x_writing_zone = document.getElementById("x_writing_zone");
	// Update the current slider value (each time you drag the slider handle)
	x_slider.oninput = function() {
		//x_output.innerHTML = this.value;
		x_writing_zone.value = this.value;
		x_plane.constant = - this.value;
		scene_manager.render();
	}
	x_writing_zone.oninput = function(){
		x_plane.constant = - this.value;
		x_slider.value = this.value;
		scene_manager.render();
	}

	var y_slider = document.getElementById("y_slider");
	y_slider.max = bbox.max.y + 1;
	y_slider.min = bbox.min.y - 1;	
	y_slider.value = y_slider.min;
	var y_writing_zone = document.getElementById("y_writing_zone");
	// Update the current slider value (each time you drag the slider handle)
	y_slider.oninput = function() {
		y_writing_zone.value = this.value;
		y_plane.constant = - this.value;
		scene_manager.render();
	}
	y_writing_zone.oninput = function(){
		y_plane.constant = - this.value;
		y_slider.value = this.value;
		scene_manager.render();
	}

	var z_slider = document.getElementById("z_slider");
	z_slider.max = bbox.max.z + 1;
	z_slider.min = bbox.min.z - 1;	
	z_slider.value = z_slider.min;
	var z_writing_zone = document.getElementById("z_writing_zone");
	// Update the current slider value (each time you drag the slider handle)
	z_slider.oninput = function() {
		z_writing_zone.value = this.value;
		z_plane.constant = - this.value;
		scene_manager.render();
	}
	z_writing_zone.oninput = function(){
		z_plane.constant = - this.value;
		z_slider.value = this.value;
		scene_manager.render();
	}
}
