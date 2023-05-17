
class buttonsGenerator {
    constructor(code_manager, cut_manager, scene_manager) {
		this.code_manager = code_manager;
		this.mesh_array = code_manager.mesh_creator.mesh_array;
		this.number_of_buttons = this.mesh_array.length;
		this.cut_manager = cut_manager;
		this.scene_manager = scene_manager;
	}

	create_buttons(){
		this.remove_transparency_buttons();
		this.remove_export_buttons();
		this.generate_grid_transparent_button();	
		this.generate_all_transparent_button();	
		this.generate_center_button();	
		this.generate_meshes_transparent_buttons();	

		this.generate_export_buttons();
	}

	generate_export_buttons(){
		let export_manager = new exportManager();	
		let div = document.createElement("div");
		let ply_button = document.createElement("button");
		ply_button.textContent = "Export to .ply";	
		let stl_button = document.createElement("button");
		stl_button.textContent = "Export to .stl";		
		let dae_button = document.createElement("button");
		dae_button.textContent = "Export to .dae";	
		let obj_button = document.createElement("button");
		obj_button.textContent = "Export to .obj";				

		let that = this;
		ply_button.addEventListener("click",function(){export_manager.export_ply("MORET", that.code_manager.group_array)}, false);
		stl_button.addEventListener("click",function(){export_manager.export_stl("MORET", that.code_manager.group_array)}, false);
		dae_button.addEventListener("click",function(){export_manager.export_dae("MORET", that.code_manager.group_array)}, false);
		obj_button.addEventListener("click",function(){export_manager.export_obj(that.code_manager.group_array)}, false);


		div.append(document.createElement("br"));
		div.appendChild(ply_button);
		div.appendChild(stl_button);
		div.appendChild(dae_button);
		div.appendChild(obj_button);
		div.append(document.createElement("br"));
		div.append(document.createElement("br"));
		document.getElementById('export_zone').appendChild(div);
	}


	generate_grid_transparent_button(){
		let div = document.createElement("div");
		div.className = "divbutton";
		let label = document.createElement("label");
		label.className = "switch";
		let input = document.createElement("input");
		input.type = "checkbox";

		input.addEventListener("click",function(){transparency_setting(this)}, false); //here 1st this = buttonsGenerator, 2nd this = input
		let that = this;
		function transparency_setting(input){
			if (input.checked == true){	
				that.scene_manager.grid.visible = false;
				that.scene_manager.render();	
			} else{				
				that.scene_manager.grid.visible = true;
				that.scene_manager.render();	
			}				
		}
		
		let para = document.createElement("p");
		para.className = "button_descriptor";
		try {
			para.innerText = "Grid transparent ";
		} catch (error) {
			para.innerText = "Grid transparent bug ";

		}
		div.appendChild(para);

		let span = document.createElement("span");
		span.className = "slider round";
		document.getElementById('buttons_zone').appendChild(div);
		div.appendChild(label);
		label.appendChild(input);
		label.appendChild(span);
	}

	generate_all_transparent_button(){
		let div = document.createElement("div");
		div.className = "divbutton";
		let label = document.createElement("label");
		label.className = "switch";
		let input = document.createElement("input");
		input.type = "checkbox";

		
		let that = this;
		input.addEventListener("click",function(){transparency_setting(this, that.mesh_array)}, false); //here 1st this = buttonsGenerator, 2nd this = input
		function transparency_setting(input, mesh_array){
			if (input.checked == true){	
				for (let i = 0; i < mesh_array.length; i++){						
					mesh_array[i].material.transparent = true;
					mesh_array[i].material.opacity = 0;
					mesh_array[i].material.needsUpdate = true;					
				}
				that.scene_manager.render();

				let checkboxes = document.getElementsByClassName("transparent_mesh_button");
				//console.log(checkboxes);
				for(var i = 0; i < checkboxes.length; i++) {
					checkboxes[i].checked = true;
				}

			} else{
				for (let i = 0; i < mesh_array.length; i++){
					mesh_array[i].material.transparent = false;
					mesh_array[i].material.opacity = 1;
					mesh_array[i].material.needsUpdate = true;
				}
				that.scene_manager.render();
				
				let checkboxes = document.getElementsByClassName("transparent_mesh_button");
				console.log(checkboxes);
				for(var i = 0; i < checkboxes.length; i++) {
					checkboxes[i].checked = false;
				}

			}				
		}
		
		let para = document.createElement("p");
		para.className = "button_descriptor";
		try {
			para.innerText = "Get every mesh transparent ";
		} catch (error) {
			para.innerText = "Get every mesh transparent bug ";

		}
		div.appendChild(para);

		let span = document.createElement("span");
		span.className = "slider round";
		document.getElementById('buttons_zone').appendChild(div);
		div.appendChild(label);
		label.appendChild(input);
		label.appendChild(span);
	}

	generate_meshes_transparent_buttons(){
		for (let i = 0; i < this.number_of_buttons; i++){
			this.create_one_button(i, this.mesh_array);
		}

		this.create_bottom_space();
		
	}

	reset_arrays(mesh_array){
		this.mesh_array = mesh_array;
		this.number_of_buttons = mesh_array.length;
	}


	generate_center_button(){
		if (this.code_manager != undefined){
			let div = document.createElement("div");
			div.className = "divbutton";
			let label = document.createElement("label");
			label.className = "switch";
			let input = document.createElement("input");
			input.type = "checkbox";
			input.addEventListener("click",function(){center_all(this)}, false);
			
			

			let that = this;
			function center_all(){
				let bbox = new THREE.Box3().setFromObject(that.code_manager.group_array[0]);
				let v_center = new THREE.Vector3( 0, 1, 0 );
				bbox.getCenter(v_center);	
				that.code_manager.group_array[0].translateX(-v_center.x);
				that.code_manager.group_array[0].translateY(-v_center.y);
				that.code_manager.group_array[0].translateZ(-v_center.z);

				that.scene_manager.set_bbox(that.code_manager);
				that.cut_manager.set_planes_position();
				that.scene_manager.render();
					
			}
			
			let para = document.createElement("p");
			para.className = "button_descriptor";
			try {
				para.innerText = "Center Plot ";
			} catch (error) {
				para.innerText = "Center Plot bug ";

			}
			div.appendChild(para);

			let span = document.createElement("span");
			span.className = "slider round";
			document.getElementById('buttons_zone').appendChild(div);
			div.appendChild(label);
			label.appendChild(input);
			label.appendChild(span);
		}
		

	}

	create_one_button(index, mesh_array){
		let div = document.createElement("div");
		div.className = "divbutton";
		let label = document.createElement("label");
		label.className = "switch";

		let input = document.createElement("input");
		input.type = "checkbox";
		input.className="transparent_mesh_button";
		input.label = "transparent_mesh_button_" + this.mesh_array[index].name;

		input.addEventListener("click",function(){transparency_setting(this, index, mesh_array)}, false); //here 1st this = buttonsGenerator, 2nd this = input
		let that = this;
		function transparency_setting(input, index, mesh_array){
			if (input.checked == true){				
				mesh_array[index].material.transparent = true;
				mesh_array[index].material.opacity = 0;
				mesh_array[index].material.needsUpdate = true;
				that.scene_manager.render();
			}else{
				mesh_array[index].material.transparent = false;
				mesh_array[index].material.opacity = 1;
				mesh_array[index].material.needsUpdate = true;
				that.scene_manager.render();
			}			
		}
		
		let para = document.createElement("p");
		para.className = "button_descriptor";
		try {
			para.innerText = "Transparent volume  " + this.mesh_array[index].name + " :";
		} catch (error) {
			para.innerText = "Transparent res_volume  " + index + " :";

		}
		div.appendChild(para);

		let span = document.createElement("span");
		span.className = "slider round";
		document.getElementById('buttons_zone').appendChild(div);
		div.appendChild(label);
		label.appendChild(input);
		label.appendChild(span);

	}

	create_bottom_space(){
		//console.log("creating spaces");	
		let para = document.createElement("p");
		para.innerText = "\n \n \n \n ";
		document.getElementById('buttons_zone').appendChild(para);
	}
	
	
	remove_transparency_buttons(){
		let myNode = document.getElementById('buttons_zone');
		myNode.innerHTML = '';
	}

	remove_export_buttons(){
		let myNode = document.getElementById('export_zone');
		myNode.innerHTML = '';
	}
	
}