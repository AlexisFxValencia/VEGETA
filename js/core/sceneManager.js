
class sceneManager {
	constructor(){
		this.scene; 
		this.renderer;
		this.camera; 	
		this.controls;
		this.grid;
		
		this.pickHelper;
		this.pickPosition;
		this.x_position;
		this.y_position;

		this.size_display;
		
		this.right_click = false;
		this.bbox;

	}
		

	scene_initialization(){		
		this.pickHelper = new PickHelper(); 
		this.pickPosition = {x: 0, y: 0};
		this.x_position = 0;
		this.y_position = 0;		

		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x999999 );
		this.scene.add( new THREE.AmbientLight( 0x999999 ) );
		this.camera = new THREE.PerspectiveCamera( 55, window.innerWidth*0.7/ window.innerHeight, 0.1, 5000 );
		
		let container = document.getElementById( "maDivDroite" );
		//document.body.appendChild( container );

		this.renderer = new THREE.WebGLRenderer();
		this.renderer.setSize( window.innerWidth*0.7, window.innerHeight);
		container.appendChild( this.renderer.domElement );

		this.grid = new THREE.GridHelper( 200, 200, 0xffffff, 0x555555 );
		this.grid.rotateOnAxis( new THREE.Vector3( 1, 0, 0 ), 90 * ( Math.PI / 180 ) );
		this.scene.add( this.grid );

		this.add_axes_helper();

		let light = new THREE.DirectionalLight( 0xffffff );
		light.position.set( 0, 1, 1 ).normalize();
		this.scene.add(light);

		window.addEventListener( 'resize', onWindowResize );
		let camera1 = this.camera;
		let renderer1 = this.renderer;
		let scene1 = this.scene;		
		function onWindowResize() {
			camera1.aspect = window.innerWidth / window.innerHeight;
			camera1.updateProjectionMatrix();
			renderer1.setSize( window.innerWidth, window.innerHeight );
			renderer1.render( scene1, camera1 );
			}

		
		this.clearPickPosition();
		window.addEventListener('mousemove', this.highlight_mesh.bind(this));
		window.addEventListener('mouseout', this.clearPickPosition.bind(this));
		window.addEventListener('mouseleave', this.clearPickPosition.bind(this));
		
		window.addEventListener('mouseup', (e) => {
			switch (e.button) {
			  case 0: //left button
				console.log("left_click;");	
				break;	
			  case 1: //middle button
				//in case.
				break;
			  case 2: //right button
				console.log("right_click;");
				this.right_click = true;
				break;
			  default:
				console.log("unknown button clicked;");
			}
		  });
		

		//this.generate_controls();
		
		this.render();
	}

	set_bbox(){
		let mybox = new THREE.Box3();
		this.scene.traverse(function (objet) {
			if (objet instanceof THREE.Mesh) {
				mybox.expandByObject(objet);
			}
		  });
		this.bbox = mybox;
		console.log("bbox", this.bbox);
	}
	

	locate_camera(){
		this.camera.position.x = 0;
		this.camera.position.y = 0;		
		this.camera.position.y = (this.bbox.min.y - this.bbox.max.y)/2;
		this.camera.position.z = 3*this.bbox.max.z;
		this.controls.update();
		this.render();
	}


	generate_controls(group_array){
		this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
		
		//this.controls.enablePan = false;
		
		let that = this;		
		this.controls.addEventListener( 'change', render2);
		function render2(){
			that.renderer.render( that.scene, that.camera );
		}

		this.controls.update();	

		document.addEventListener('keydown',sendKeyDown);
		function sendKeyDown(event){
			let code = event.code;
			if (code=='ArrowRight') keyMoveRight();
			if (code=='ArrowLeft') keyMoveLeft();
			if (code=='ArrowUp') keyMoveUp();
			if (code=='ArrowDown') keyMoveDown();
			render2();	
		}
				
		function keyMoveRight() {			
			for (let group of group_array){
				group.position.x += 5;
			}
			
		}		
		function keyMoveLeft() {
			for (let group of group_array){
				group.position.x -= 5;
			}
		}		
		function keyMoveUp() {
			for (let group of group_array){
				group.position.y += 5;
			}
		}		
		function keyMoveDown() {
			for (let group of group_array){
				group.position.y -= 5;
			}
		}
		
	}


	
	render() {
		this.renderer.render( this.scene, this.camera );
	}


	getSceneGraph(object){
		console.log("object", object);
		console.log("object.parent", object.parent);	
		if (object.children.length > 0){
			for (let child of object.children){					
				this.getSceneGraph(child);			
			}		
		} 	
	}
	
	add_axes_helper(){
		const axesHelper = new THREE.AxesHelper( 1 );
		this.scene.add( axesHelper );
		/*
		
		var  textGeo = new THREE.TextGeometry('Y', {
			size: 5,
			height: 2,
			curveSegments: 6,
			font: "helvetiker",
			style: "normal"       
	   });
	   
	   var  color = new THREE.Color();
	   color.setRGB(255, 250, 250);
	   var  textMaterial = new THREE.MeshBasicMaterial({ color: color });
	   var  text = new THREE.Mesh(textGeo , textMaterial);
	   
	   text.position.x = axis.geometry.vertices[1].x;
	   text.position.y = axis.geometry.vertices[1].y;
	   text.position.z = axis.geometry.vertices[1].z;
	   text.rotation = camera.rotation;
	   this.scene.add(text);
	   */
	   
	}

	highlight_mesh(event){
		//console.log("event.clientX", event.clientX);
		//console.log("event.clientY", event.clientY);
		let maDivDroite = document.getElementById("maDivDroite");
		let margin_top_px = window.getComputedStyle(maDivDroite, null).getPropertyValue('margin-top')  
		let margin_top = parseInt(margin_top_px, 10);
		let canvas = this.renderer.domElement;		
		this.x_position = ((event.clientX - 0.3* window.innerWidth) / canvas.width) * 2 - 1;
		this.y_position = ((event.clientY - margin_top)/ canvas.height) * (-2) + 1; 
		this.pickHelper.pick(this.x_position, this.y_position, this.scene, this.camera);
		this.pickHelper.display_picked_object_data(this.scene);
		if (this.right_click){
			this.pickHelper.set_picked_object_transparent(this.right_click);	
			this.right_click = false;	
		}
		this.renderer.render( this.scene, this.camera );
	}

	clearPickPosition() {
		// unlike the mouse which always has a position
		// if the user stops touching the screen we want
		// to stop picking. For now we just pick a value
		// unlikely to pick something
		//this.pickPosition.x = -100000;
		//this.pickPosition.y = -100000;
		this.x_position = - 10000;
		this.y_position = - 10000;
		//console.log("x_position : ", this.x_position);
	}

	
	
}