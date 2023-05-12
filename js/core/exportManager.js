class exportManager{
    constructor(){

    }

export_dae(code_choice, group_array){
	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link );
	
	// Instantiate an exporter
	const exporter = new ColladaExporter();

	// Parse the input and generate the ply output
	let result;
	if (code_choice == "MORET"){
		result = exporter.parse(group_array[0]); 
	} else if (code_choice == "SERPENT"){
		result = exporter.parse(group_array[0]); 
	}
	
	saveString( result.data, 'essai.dae' );

	console.log(result.textures);
	result.textures.forEach( tex => {

		saveArrayBuffer( tex.data, `${ tex.name }.${ tex.ext }` );

	} );

	function save( blob, filename ) {
		link.href = URL.createObjectURL( blob );
		link.download = filename;
		link.click();

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}

	function saveArrayBuffer( buffer, filename ) {

		save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

	}
}


export_obj(group_array){
	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link );
	
	// Instantiate an exporter
	const exporter = new OBJExporter();

	// Parse the input and generate the ply output
	const result = exporter.parse(group_array[0] ); 
	saveString( result, 'essai.obj' );

	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename;
		link.click();

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}

	function saveArrayBuffer( buffer, filename ) {

		save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

	}
}



export_stl(code_choice, group_array){
	var link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link );
	
	//alert("coucou");
	// Instantiate an exporter
	const exporter = new STLExporter();

	// Parse the input and generate the ply output
	//console.log(group_array[0][0]);
	//const result = exporter.parse(group_array[0][0]); //upAxis: 'Y_UP', unitName: 'millimeter', unitMeter: 0.001
	
	let result;
	if (code_choice == "MORET"){
		result = exporter.parse(group_array[0]); 
	} else if (code_choice == "SERPENT"){
		result = exporter.parse(group_array[0]); 
	}
	
	
	saveString( result.data, 'essai.stl' );


	function save( blob, filename ) {

		link.href = URL.createObjectURL( blob );
		link.download = filename;
		link.click();

	}

	function saveString( text, filename ) {

		save( new Blob( [ text ], { type: 'text/plain' } ), filename );

	}
}



export_ply(code_choice, group_array){	
	const link = document.createElement( 'a' );
	link.style.display = 'none';
	document.body.appendChild( link );
	
	const exporter = new PLYExporter();
	
	
	// Parse the input and generate the ply output	
	let result_array;
	if (code_choice == "MORET"){
		result_array = exporter.parse_2(group_array[0]); 
	} else if (code_choice == "SERPENT"){
		result_array = exporter.parse(group_array[0]); 
	}
	

	
	saveString( result_array, 'essai.ply' );
	

	/*
	function generate_exported_group(){
		let exported_group = group_array[0].clone(true);
		console.log("exported_group before remove transparent mesh", exported_group);
		remove_transparent_meshes(exported_group);
		console.log("exported_group after", exported_group);
		return exported_group
	}
	*/

	/*
	function remove_transparent_meshes(group){
		for (let child of group.children){
			console.log("child name:", child.name);
			console.log("child transparent:", child.material.transparent);
			console.log("child opacity:", child.material.opacity);
			if (child.material.transparent == true && child.material.opacity == 0){
				console.log("remove : ", child.name);
				//child.removeFromParent();
				for (let child2 of child.children){
					group.add(child2);					
				}
				child.removeFromParent();
			}
			if (child.children != null){
				console.log("child.children not null for :",child.name);
				//console.log("remove transparent mesh");
				remove_transparent_meshes(child);
			}
		}		
	}
	*/


	function save( blob, filename ) {
		link.href = URL.createObjectURL( blob );
		link.download = filename;
		link.click();
	}

	function saveString( result_array, filename ) {
		//save( new Blob( [ text ], { type: 'text/plain' } ), filename );

		/*
		let result_array = [];
		result_array.push("coucou coucou \n");
		result_array.push("yoyo \n");
		*/

		save( new Blob( result_array, { type: 'text/plain' } ), filename );
	}

	function saveArrayBuffer( buffer, filename ) {

		save( new Blob( [ buffer ], { type: 'application/octet-stream' } ), filename );

	}


}

}