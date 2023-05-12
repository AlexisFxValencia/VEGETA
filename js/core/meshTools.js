class meshTools{
    constructor(){

    }
    
    getRandomColor() {
        let color = new THREE.Color( 0xffffff );
        color.setHex( Math.random() * 0xffffff );
        return color;
    }

	attribute_material_color(material_name){
        let color;
		if (material_name.toLowerCase().startsWith("fuel") || material_name.toLowerCase().startsWith("combustible") || material_name.toLowerCase().startsWith("fissile")){
			color = new THREE.Color(0x18601B); //gray green for fuel
		} else if (material_name.toLowerCase().startsWith("alu")){
			color = new THREE.Color(0x80899a); //gray for aluminium
		} else if (material_name.toLowerCase().startsWith("steel")|| material_name.toLowerCase().startsWith("acier")){
			color = new THREE.Color(0x4D5B7C); //dark gray for aluminium
		} else if (material_name.toLowerCase().startsWith("eau") || material_name.toLowerCase().startsWith("water")){
			color = new THREE.Color(0x3379ff); //blue for water
		} else if (material_name.toLowerCase().startsWith("graphite") || material_name.toLowerCase().startsWith("water")){
			color = new THREE.Color(0x251607); //blue for water
		}else {	
			color = this.getRandomColor()
		}
        return color;
    }

    rotate_mesh(mesh, wanted_direction){
		let axis = new THREE.Vector3(0, 1, 0);			
		let quaternion = new THREE.Quaternion(); 
		quaternion.setFromUnitVectors(axis, wanted_direction);
		let matrix = new THREE.Matrix4();
		matrix.makeRotationFromQuaternion( quaternion ); //--> transfo qui ne s'applique PAS aux enfants de moret_cell.
		mesh.geometry.applyMatrix4(matrix);
	}

    geometrical_substraction(container, moret_cell){		
		if (container != undefined && moret_cell != undefined && container.geometry != undefined){		
			container.updateMatrix();
			moret_cell.updateMatrix();
			let bsp_mother = CSG.fromMesh(container);
			let bsp_son = CSG.fromMesh(moret_cell );                        
			let bsp_mother_sub = bsp_mother.subtract(bsp_son);
			let mesh_mother_sub = CSG.toMesh( bsp_mother_sub, container.matrix, container.material );	
			container.geometry = mesh_mother_sub.geometry;

		}

	}

	geometrical_multiple_substraction(substracted_mesh, substractor_mesh_list){		
		substracted_mesh.updateMatrix();
		let bsp_mother = CSG.fromMesh(substracted_mesh);
		
		for (let substractor_mesh of substractor_mesh_list){
			substractor_mesh.updateMatrix();		
			let bsp_son = CSG.fromMesh(substractor_mesh);                        
			bsp_mother = bsp_mother.subtract(bsp_son);
			
		}

		let mesh_mother_sub = CSG.toMesh( bsp_mother, substracted_mesh.matrix, substracted_mesh.material );	
		substracted_mesh.geometry = mesh_mother_sub.geometry;
		

	}

	container_geometrical_substraction(container, moret_cell){
		
		if (container != undefined && moret_cell != undefined && container.geometry != undefined){
			//console.log("substraction");
			//console.log("container", container);
			//console.log('moret_cell', moret_cell);

			//Il faut translater la cellule moret avec soustraction car la librairie CSG utilise les attributs position des objets (comme si c'était des positions absolues)
			// Or un Mesh Three JS retient les liens de parentalité des Mesh et utilise donc leur coordonnées locales (ie par rapport au parent)
			
			
			moret_cell.translateX(container.position.x);
			moret_cell.translateY(container.position.y);
			moret_cell.translateZ(container.position.z);
			
			
			container.updateMatrix();
			moret_cell.updateMatrix();
			let bsp_mother = CSG.fromMesh(container);
			let bsp_son = CSG.fromMesh(moret_cell );                        
			let bsp_mother_sub = bsp_mother.subtract(bsp_son);
			let mesh_mother_sub = CSG.toMesh( bsp_mother_sub, container.matrix, container.material );	
			container.geometry = mesh_mother_sub.geometry;
			
			
			moret_cell.translateX( - container.position.x);
			moret_cell.translateY( - container.position.y);
			moret_cell.translateZ( - container.position.z);
						

			//console.log("end substraction");
			//console.log("container", container);
			//console.log('moret_cell', moret_cell);
		}
		/*
		
		if (container.parent != undefined && container.parent.geometry != undefined){
			geometrical_substract(container.parent, moret_cell)
		}
		*/
	}

	container_bsp_substraction(vector, container, bsp_son){		
		if (container != undefined && container.geometry != undefined){		
			container.updateMatrix();
			let bsp_mother = CSG.fromMesh(container);  
			bsp_son.translate(vector.x, vector.y, vector.z)                  
			let bsp_mother_sub = bsp_mother.subtract(bsp_son);	
			bsp_son.translate(-vector.x, -vector.y, -vector.z)                      
		
			let mesh_mother_sub = CSG.toMesh( bsp_mother_sub, container.matrix, container.material );	
			container.geometry = mesh_mother_sub.geometry;
			container.updateMatrix();
	}
}

	toDegrees (radians) {
		return radians * (180 / Math.PI);
	}

	toRadians(degrees){
		return degrees * (Math.PI/180);
	}

	ellipsoid_z_mesh_creator(a,b,c){
		console.log("ellipsoid creation");
		var geometry = new THREE.SphereGeometry(a, 32, 16 );
		geometry.applyMatrix( new THREE.Matrix4().makeScale( 1.0, b/a, c/a ) );
		let material = new THREE.MeshBasicMaterial({color: this.getRandomColor()});
		let mesh = new THREE.Mesh(geometry, material);
		return mesh;
	}

	hexprism_z_mesh_creator(side, height, azimuth = 0){		
		let cos60 = 0.5;
		let sin60 = 0.866025;

		var coordinatesList = [
			new THREE.Vector3(side, 0, 0),
			new THREE.Vector3(cos60*side, sin60*side, 0),
			new THREE.Vector3(-cos60*side, sin60*side, 0),
			new THREE.Vector3(-side, 0, 0),
			new THREE.Vector3(-cos60*side, -sin60*side, 0),
			new THREE.Vector3(cos60*side, -sin60*side, 0)
		];
		
		let extrudeSettings = { depth: height, bevelEnabled : false};
		let geomShape = new THREE.ExtrudeGeometry( new THREE.Shape(coordinatesList), extrudeSettings );

		geomShape.center(); // permet de centrer la géométrie, très important.

		let matShape = new THREE.MeshBasicMaterial({color: this.getRandomColor()});
		let mesh = new THREE.Mesh(geomShape, matShape);

		var matLines = new THREE.LineBasicMaterial({color: "magenta"});
		var lines = new THREE.LineLoop(geomShape, matLines);

		//rotation of phi angle
		let azimuth_radians = this.toRadians(azimuth);

		let cosa = Math.cos(azimuth_radians);
		let sina = Math.sin(azimuth_radians);
		let axis = new THREE.Vector3(1, 0, 0);
		let vector = new THREE.Vector3(cosa, sina, 0);		
		var quaternion = new THREE.Quaternion(); 
		quaternion.setFromUnitVectors(axis, vector);
		const matrix = new THREE.Matrix4();
		matrix.makeRotationFromQuaternion( quaternion ); //--> transfo qui ne s'applique PAS aux enfants de moret_cell.
		mesh.geometry.applyMatrix4(matrix);
		return mesh;		//on verra pour les lines plus tard.
	}

	
	generate_texture(){
		let ctx = document.createElement('canvas').getContext('2d');
		ctx.canvas.width = 256;
		ctx.canvas.height = 256;
		ctx.fillStyle = "#FF00FF";//this.getRandomColor;//'#FDB';
		ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		let texture = new THREE.CanvasTexture(ctx.canvas);
		texture.needsUpdate = true;
		return texture;
	}

	search_object(name, group_array){
		//console.log("searched object name : ", name);
		//console.log("group_array : ", group_array);
		for (let group of group_array){
			let object = group.getObjectByName(name);
			if (object != undefined){
				//console.log(name, "found");	
				return object;
			}
		}
		console.log(name, "not found");	
		
	}

	

}