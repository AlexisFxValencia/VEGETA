let firstStart = true;

// Loading button management (text or xml file)
const fileSelector = document.getElementById('uploader');
let fileReader = new FileReader();
let input_is_xml = false;

fileReader.onload = function(event) {	
	console.log('reading loaded input file...')			
	document.getElementById("input_box").value = fileReader.result;
	let code_choice = auto_detect_code();	
	document.getElementById("code-select").value = code_choice;		
};


fileSelector.addEventListener('change', (event) => {
	let input_file = event.target.files[0];
	fileReader.readAsText(input_file);
	let input_is_xml = false;		
	if(input_file.type == "text/xml"){
		console.log("the input file is a xml file");
		input_is_xml = true;
	}	
	let code_choice = auto_detect_code();	
	document.getElementById("code-select").value = code_choice;	
});	



function start_or_refresh(){	
	const startTime = performance.now();
	let code_choice = document.getElementById("code-select").value;		
	if (code_choice == "auto-detect"){
		code_choice = auto_detect_code();
		document.getElementById("code-select").value = code_choice;	
	} 

	if (code_choice == "MORET"){
		generate_moret_rendering();		
	} else if (code_choice == "SERPENT"){
		generate_serpent_rendering();			
	} else if(code_choice == "TRIPOLI"){
		alert("sorry, Tripoli not available for now, work in progress...");
	} else if (code_choice == "OpenMC"){
		generate_openmc_rendering();
		/*
		input_is_xml = false;
		let text = document.getElementById("input_box").value;
		convert_openmp_moret();
		generate_moret_rendering();	
		document.getElementById("input_box").value = text;
		*/


	} else if(code_choice == "MCNP"){
		alert("sorry, MCNP not available for now, work in progress...");
	} 
	
	const endTime = performance.now();
	const executionTime = endTime - startTime;
	console.log("Execution time :", executionTime/1000, "sec");
}

function auto_detect_code(){
	let text = document.getElementById("input_box").value;
	console.log("text", text);
	if (text.includes('TYPE') && text.includes('VOLU')){
		return "MORET";
	} else if(text.includes('<cell') && text.includes('<surface')){
		return "OpenMC";
	} else {
		console.log("Could not detect the neutronic code used. Please choose it manually.");
		return "Code Detection problem";
	}
	
}


function generate_moret_rendering(){
	console.log('Generating the 3D geometry of the MORET input file...');
	let text = document.getElementById("input_box").value;
	let moret_reader = new moretReader();

	if (input_is_xml){
		moret_reader.parsing_xml(text);
	} else {
		moret_reader.parsing(text);
	}	
	
	clean_previous_genereration();
	let scene_manager;		
	let moret_manager;	
	scene_manager = new sceneManager();
	scene_manager.scene_initialization();		
	cut_manager = new cutManager(scene_manager);
	cut_manager.set_planes();
	moret_manager = new moretManager(scene_manager, moret_reader, cut_manager);
	scene_manager.generate_controls(moret_manager.group_array, cut_manager);	
	
	
	moret_manager.create_objects_in_the_scene();
	let buttons_generator = new buttonsGenerator(moret_manager, cut_manager, scene_manager);
	buttons_generator.create_buttons(); 		 
	scene_manager.set_bbox(); 
	scene_manager.locate_camera(); 
	cut_manager.set_planes_position(); 
	scene_manager.render();
}

function generate_serpent_rendering(){
	console.log('Generating the 3D geometry of the SERPENT 2 input file...')
	let text = document.getElementById("input_box").value;
	let serpent_reader = new serpentReader();
	serpent_reader.parsing(text);
	clean_previous_genereration();

	let scene_manager;	
	let serpent_manager;	
	scene_manager = new sceneManager();		
	scene_manager.scene_initialization();	
	cut_manager = new cutManager(scene_manager);
	cut_manager.set_planes();
	serpent_manager = new serpentManager(scene_manager, serpent_reader);
	scene_manager.generate_controls(serpent_manager.group_array);
	
	serpent_manager.create_objects_in_the_scene();	
	let buttons_generator = new buttonsGenerator(serpent_manager, cut_manager, scene_manager);  
	buttons_generator.create_buttons(); 	 
	scene_manager.set_bbox(); 
	scene_manager.locate_camera();	
	cut_manager.set_planes_position(); 		
	scene_manager.render();
}

function generate_openmc_rendering(){
	console.log('Generating the 3D geometry of the OpenMC input file...')
	let text = document.getElementById("input_box").value;	
	let openMC_reader = new openMCReader();
	openMC_reader.parsing_xml(text);
	clean_previous_genereration();

	let scene_manager;
	let openMC_manager;
	scene_manager = new sceneManager();	
	scene_manager.scene_initialization();
	cut_manager = new cutManager(scene_manager);
	cut_manager.set_planes();
	openMC_manager = new openMCManager(scene_manager, openMC_reader);
	scene_manager.generate_controls(openMC_manager.group_array);	
	openMC_manager.mesh_creator.add_z_cut_listener();
	openMC_manager.create_objects_in_the_scene();
	if (!firstStart){
		openMC_manager.mesh_creator.remove_points_from_the_scene(); // a corriger car là il y a peu de mesh dans la scene qui peut être enlevé.	
	}
	console.log("openMC_manager", openMC_manager);
	let buttons_generator = new buttonsGenerator(openMC_manager, cut_manager, scene_manager);
	buttons_generator.create_buttons(); 	

	scene_manager.set_bbox(); 
	scene_manager.locate_camera();	
	scene_manager.render();
}

function convert_openmp_moret(){
	console.log("converting openmc into moret ...");	
	let openMC_reader = new openMCReader();
	text = document.getElementById("input_box").value;
	openMC_reader.parsing_xml(text); 
	document.getElementById("input_box").value = openMC_reader.to_moret();
}


function clean_previous_genereration(){
	if (firstStart){
		console.log("First 3D Generation")
		document.getElementById('start_button').value = "Refresh";		
		firstStart = false;			
		let help_version = document.getElementById( "maDivDroite" );
		help_version.innerHTML = "";
	} else {
		console.log("Refresh 3D Generation");
		let container = document.getElementById( "maDivDroite" );
		while (container.firstChild) {
			container.removeChild(container.firstChild);
		}		
	} 
}
