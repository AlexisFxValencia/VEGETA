
class buttonsGenerator {
    constructor(code_manager, mesh_array, cut_manager, scene_manager, documentHTML) {
		this.code_manager = code_manager;
		this.mesh_array = mesh_array;
		this.number_of_buttons = mesh_array.length;
		this.document = documentHTML;
		this.cut_manager = cut_manager;
		this.scene_manager = scene_manager;
	}

	create_buttons(){
		this.generate_grid_transparent_button();	
		this.generate_all_transparent_button();	
		this.generate_center_button();	
		this.generate_meshes_transparent_buttons();	
	}

	generate_grid_transparent_button(){
		let div = this.document.createElement("div");
		div.className = "divbutton";
		let label = this.document.createElement("label");
		label.className = "switch";
		this.input = this.document.createElement("input");
		this.input.type = "checkbox";

		this.input.addEventListener("click",function(){transparency_setting(this)}, false); //here 1st this = buttonsGenerator, 2nd this = input
		function transparency_setting(input){
			if (input.checked == true){	
				scene_manager.grid.visible = false;
				scene_manager.render();	
			} else{				
				scene_manager.grid.visible = true;
				scene_manager.render();	
			}				
		}
		
		let para = this.document.createElement("p");
		para.className = "button_descriptor";
		try {
			para.innerText = "Grid transparent ";
		} catch (error) {
			para.innerText = "Grid transparent bug ";

		}
		div.appendChild(para);

		let span = this.document.createElement("span");
		span.className = "slider round";
		this.document.getElementById('buttons_zone').appendChild(div);
		div.appendChild(label);
		label.appendChild(this.input);
		label.appendChild(span);
	}

	generate_all_transparent_button(){
		let div = this.document.createElement("div");
		div.className = "divbutton";
		let label = this.document.createElement("label");
		label.className = "switch";
		this.input = this.document.createElement("input");
		this.input.type = "checkbox";

		

		this.input.addEventListener("click",function(){transparency_setting(this, mesh_array)}, false); //here 1st this = buttonsGenerator, 2nd this = input
		function transparency_setting(input, mesh_array){
			if (input.checked == true){	
				for (let i = 0; i < mesh_array.length; i++){						
					mesh_array[i].material.transparent = true;
					mesh_array[i].material.opacity = 0;
					mesh_array[i].material.needsUpdate = true;					
				}
				scene_manager.render();

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
				scene_manager.render();
				
				let checkboxes = document.getElementsByClassName("transparent_mesh_button");
				console.log(checkboxes);
				for(var i = 0; i < checkboxes.length; i++) {
					checkboxes[i].checked = false;
				}

			}				
		}
		
		let para = this.document.createElement("p");
		para.className = "button_descriptor";
		try {
			para.innerText = "Get every mesh transparent ";
		} catch (error) {
			para.innerText = "Get every mesh transparent bug ";

		}
		div.appendChild(para);

		let span = this.document.createElement("span");
		span.className = "slider round";
		this.document.getElementById('buttons_zone').appendChild(div);
		div.appendChild(label);
		label.appendChild(this.input);
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
			let div = this.document.createElement("div");
			div.className = "divbutton";
			let label = this.document.createElement("label");
			label.className = "switch";
			this.input = this.document.createElement("input");
			this.input.type = "checkbox";
			this.input.addEventListener("click",function(){center_all(this)}, false);
			
			

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
			
			let para = this.document.createElement("p");
			para.className = "button_descriptor";
			try {
				para.innerText = "Center Plot ";
			} catch (error) {
				para.innerText = "Center Plot bug ";

			}
			div.appendChild(para);

			let span = this.document.createElement("span");
			span.className = "slider round";
			this.document.getElementById('buttons_zone').appendChild(div);
			div.appendChild(label);
			label.appendChild(this.input);
			label.appendChild(span);
		}
		

	}

	create_one_button(index, mesh_array){
		let div = this.document.createElement("div");
		div.className = "divbutton";
		let label = this.document.createElement("label");
		label.className = "switch";

		this.input = this.document.createElement("input");
		this.input.type = "checkbox";
		this.input.className="transparent_mesh_button";
		this.input.label = "transparent_mesh_button_" + this.mesh_array[index].name;
		
		//this.input.type = "checkbox";
		//console.log("proche du bouton");

		this.input.addEventListener("click",function(){transparency_setting(this, index, mesh_array)}, false); //here 1st this = buttonsGenerator, 2nd this = input
		function transparency_setting(input, index, mesh_array){
			if (input.checked == true){				
				mesh_array[index].material.transparent = true;
				mesh_array[index].material.opacity = 0;
				mesh_array[index].material.needsUpdate = true;
				scene_manager.render();
			}else{
				mesh_array[index].material.transparent = false;
				mesh_array[index].material.opacity = 1;
				mesh_array[index].material.needsUpdate = true;
				scene_manager.render();
			}			
		}
		
		let para = this.document.createElement("p");
		para.className = "button_descriptor";
		try {
			para.innerText = "Transparent volume  " + this.mesh_array[index].name + " :";
		} catch (error) {
			para.innerText = "Transparent res_volume  " + index + " :";

		}
		div.appendChild(para);

		let span = this.document.createElement("span");
		span.className = "slider round";
		this.document.getElementById('buttons_zone').appendChild(div);
		div.appendChild(label);
		label.appendChild(this.input);
		label.appendChild(span);

	}

	create_bottom_space(){
		//console.log("creating spaces");	
		let para = this.document.createElement("p");
		para.innerText = "\n \n \n \n ";
		this.document.getElementById('buttons_zone').appendChild(para);
	}
	
	
	remove_transparency_buttons(){
		let myNode = this.document.getElementById('buttons_zone');
		myNode.innerHTML = '';
	}
	
}