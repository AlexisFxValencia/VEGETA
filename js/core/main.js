var scene_manager;
var mesh_tools;
var mesh_array = [];
var moret_reader;
var serpent_reader;
var moret_manager;
var serpent_manager;

var buttons_generator; 


// Loading button management (text or xml file)
const fileSelector = document.getElementById('uploader');
let fileReader = new FileReader();
var input_is_xml = false;

fileReader.onload = function(event) {	
	console.log('reading loaded input file...')			
	document.getElementById("textareabox").value = fileReader.result;
};

fileSelector.addEventListener('change', (event) => {
	var fileList = event.target.files;
	fileReader.readAsText(event.target.files[0]);		
	if(event.target.files[0].type == "text/xml"){
		console.log("the nput file is a xml file");
		input_is_xml = true;
	}
	});	


function start_or_refresh(){
	
	var text = document.getElementById("textareabox").value;

	code_choice = document.getElementById("code-select").value;		
	var mesh_tools = new meshTools();	

	console.log('plotting input file...')	
	if (code_choice == "MORET"){
		moret_reader = new moretReader(mesh_tools);
		if (input_is_xml){
			moret_reader.parsing_xml(text);
		} else {
			moret_reader.parsing(text);
		}
		

		if (firstStart){
			console.log("MORET first parsing")
			document.getElementById('start_button').value = "Refresh";			
			scene_manager = new sceneManager();
			scene_manager.scene_initialization();	
			
			cut_manager = new cutManager(scene_manager);
        	cut_manager.set_planes();
			moret_manager = new moretManager(moret_reader, mesh_tools, cut_manager, document);

			scene_manager.generate_controls(moret_manager);			

			firstStart = false;			
		} else {
			console.log("refresh MORET parsing");
			buttons_generator.remove_transparency_buttons();
			moret_manager.remove_objects_from_scene();	
			mesh_array = [];
			moret_manager.reset(moret_reader);
		} 
		moret_manager.create_objects_in_the_scene();
		buttons_generator = new buttonsGenerator(moret_manager, mesh_array, cut_manager, scene_manager, document);
		buttons_generator.create_buttons(); 		 
		scene_manager.set_bbox(moret_manager); 
		scene_manager.locate_camera(); 
		cut_manager.set_planes_position(); 
		scene_manager.render();
		
	} else if (code_choice == "SERPENT"){
		serpent_reader = new serpentReader(mesh_tools);
        serpent_reader.parsing(text);
		if (firstStart){
			console.log("SERPENT first parsing");
			document.getElementById('start_button').value = "Refresh";				
            scene_manager = new sceneManager();		
			scene_manager.scene_initialization();	
			cut_manager = new cutManager(scene_manager);
        	cut_manager.set_planes();
			serpent_manager = new serpentManager(serpent_reader, mesh_array, mesh_tools, document);

			scene_manager.generate_controls(serpent_manager);	
			
			firstStart = false;	
		} else {
			console.log("refresh SERPENT parsing");
			buttons_generator.remove_transparency_buttons();
			serpent_manager.remove_objects_from_scene(); // a corriger car là il y a peu de mesh dans la scene qui peut être enlevé.	
			mesh_array = [];
			serpent_manager.reset(serpent_reader);
		}
		serpent_manager.create_objects_in_the_scene();	
		buttons_generator = new buttonsGenerator(serpent_manager, mesh_array, cut_manager, scene_manager, document);  
		buttons_generator.create_buttons(); 	 
		scene_manager.set_bbox(serpent_manager); 
		scene_manager.locate_camera();	
		cut_manager.set_planes_position(); 		
		scene_manager.render();
			
	} else if(code_choice == "TRIPOLI"){
		alert("sorry, Tripoli not available for now, work in progress...");
	}else if(code_choice == "MCNP"){
		alert("sorry, MCNP not available for now, work in progress...");
	} else if (code_choice == "OpenMC"){
		openMC_reader = new openMCReader(mesh_tools);
		openMC_reader.parsing_xml(text);
		if (firstStart){
			console.log("OpenMC first parsing");
			document.getElementById('start_button').value = "Refresh";				
            scene_manager = new sceneManager();		
			scene_manager.scene_initialization();	
			//set_planes();
			openMC_manager = new openMCManager(mesh_tools, openMC_reader);

			scene_manager.generate_controls(openMC_manager);

			openMC_manager.add_z_cut_listener();
			firstStart = false;	
		} else {
			console.log("refresh OpenMC parsing");
			openMC_manager.remove_points_from_the_scene(); // a corriger car là il y a peu de mesh dans la scene qui peut être enlevé.	
	
		}
		//console.log(openMC_manager.z_cut);
		openMC_manager.create_objects_in_the_scene();
		
		//scene_manager.set_bbox(openMC_manager); 
		scene_manager.locate_camera();	
		scene_manager.render();		
	}
}



