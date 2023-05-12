
class serpentReader{
    constructor(){
        this.mesh_tools = new meshTools();
        this.universe_array = [];
        this.surf_array = [];
        this.cell_array = [];
        this.filled_cell_array = [];
        this.pin_array = [];
        this.mate_array = [];
        this.cartesian_lattice_array = [];
        this.circular_lattice_array = [];
        this.pin_name_list = [];
    }

    parsing(text){
        console.log("serpent reading");
        //console.log(" Serpent Code being implemented... :-)");

        text = this.delete_beginning_spaces(text);
        //delete comments line in the input file for simplyfing parsing.
        text = text.replace(/%/gm, '\n%'); 
        text = text.replace(/^%.*$/gm, '');
        text = text.replace(/^\*.*$/gm, '');
        text = text.replace(/^\/\*.*$/gm, '');
        
        //console.log(text);

        let lines = text.split('\n');
        
        
        for(let i = 0; i < lines.length ; i++){
            //this.delete_comment_lines(lines[i]);
            this.surf_reading(lines[i]);
            this.mate_reading(lines[i]);
            this.cell_reading(lines[i]);
        }
        
        for(let i = 0; i < lines.length ; i++){
            this.pin_reading(i, lines);
        }
        console.log("pin_array : ", this.pin_array);


        this.fill_pin_name_list();

        console.log("mate_array:", this.mate_array);  
        //console.log("surf_array:", this.surf_array);        
        //console.log("cell_array:", this.cell_array);
        //console.log("filled_cell_array:", this.filled_cell_array);

        this.lattice_reading(text);
        

        this.fill_universe_array();
    }


    delete_beginning_spaces(text){
        let text2 = [];
        let lines = text.split('\n');
        for(let i = 0; i < lines.length ; i++){
            let line = lines[i].trim();
            text2.push(line);
        }
        return text2.join('\n');
    }

    //pin_reading(text){
    pin_reading(i, lines){    
        console.log("pin reading");
        //text = text.split('pin').pop().split('pin')[0];	
        //text = text.split('pin').pop().split('surf')[0];
        //let lines = text.split('\n');

        let line_array = lines[i].trim().split(/\s+/);

        if (line_array[0] == "pin"){
            let temp_array = [];
            let pin_name = line_array[1];
            //console.log("pin_name",pin_name);
            let col_id_mate = this.mate_array.map(function(value,index) { return value[0]; });	
            //console.log("col_id_mate", col_id_mate);
            let j = 1;
            let material;
            do {
                line_array = lines[i+j].trim().split(/\s+/);
                material = line_array[0];
                let radius = parseFloat(line_array[1]);
                //if (!isNaN(radius)){
                   temp_array.push([pin_name, material, radius]);    
                //}
                              
                line_array = lines[i+j+1].trim().split(/\s+/);
                material = line_array[0];
                j++;
            } while (col_id_mate.includes(material) || material == "void" || material == "water");

            temp_array.sort(this.sortFunction);     
            this.pin_array.push(temp_array);

        }
        /*
        let temp_array = [];
        
        for(let i = 0; i < lines.length ; i++){
            line_array = lines[i].split(/\s+/);
            if (col_id_mate.includes(line_array[0])){
                let material = line_array[0];
                let radius = parseFloat(line_array[1]);
                if (!isNaN(radius)){
                    temp_array.push([pin_name, material, radius]); // sûrement à adapter par la suite
                }
                
            }
        }
        temp_array.sort(this.sortFunction);        
        //this.pin_array.push(temp_array_name_pin);
        this.pin_array.push(temp_array); 
        console.log("pin_array : ", this.pin_array);
        */
    }

    fill_pin_name_list(){
        if (this.pin_array[0] != undefined){
            this.pin_name_list = this.pin_array.map(function(value,index1) { return value[0][0]; });
        }		
    }

    sortFunction(a, b) {
        if (a[2] === b[2]) {
            return 0;
        }
        else {
            return (a[2] > b[2]) ? -1 : 1;
        }
    }

    surf_reading(line){
        line = line.trim();
		let line_array = line.split(/\s+/);
        if(line_array[0]=="surf"){
            let surf_name = line_array[1];
            if (line_array[2]=="sqc"){
                let x = parseFloat(line_array[3]);
                let y = parseFloat(line_array[4]);
                let d = parseFloat(line_array[5]);
                this.surf_array.push([surf_name, "sqc", x, y, d, 0, 0]);
                //console.log("reading surf sqc", [surf_name, "sqc", x, y, d, 0, 0]);
            } else if (line_array[2]=="cube"){
                let x = parseFloat(line_array[3]);
                let y = parseFloat(line_array[4]);
                let z = parseFloat(line_array[5]);
                let d = parseFloat(line_array[6]);
                this.surf_array.push([surf_name, "cube", x, y, z, d, 0]);
                //console.log("reading surf cube", [surf_name, "cube", x, y, z, d, 0]);
            } else if(line_array[2]=="cuboid"){
                let x0 = parseFloat(line_array[3]);
                let x1 = parseFloat(line_array[4]);
                let y0 = parseFloat(line_array[5]);
                let y1 = parseFloat(line_array[6]);
                let z0 = parseFloat(line_array[7]);
                let z1 = parseFloat(line_array[8]);
                this.surf_array.push([surf_name, "cuboid", x0, x1, y0, y1, z0, z1]);

            } else if (line_array[2]=="cylz" || line_array[2]=="cyl"){
                let x = parseFloat(line_array[3]);
                let y = parseFloat(line_array[4]);
                let r = parseFloat(line_array[5]);
                this.surf_array.push([surf_name, "cylz", x, y, r, 0, 0]);
                //console.log("reading surf cylz", [surf_name, "cylz", x, y, r, 0, 0]);
            } else if (line_array[2]=="sph"){
                let x = parseFloat(line_array[3]);
                let y = parseFloat(line_array[4]);
                let z = parseFloat(line_array[5]);
                let r = parseFloat(line_array[6]);
                this.surf_array.push([surf_name, "sph", x, y, z, r, 0]);
                //console.log("reading surf sph", [surf_name, "sph", x, y, z, r, 0]);
            } 

        }
    }

    mate_reading(line) {
		line = line.trim();
		let line_array = line.split(/\s+/);
		if (line_array[0]=="mat"){
			let id_mate = line_array[1];
			let color = this.mesh_tools.attribute_material_color(id_mate);			
							
			this.mate_array.push([id_mate, color]);		
            //console.log("[id_mate, color]", [id_mate, color]);			
		} 
	}

    cell_reading(line){
        line = line.trim();
		let line_array = line.split(/\s+/);
        // a ameliorer
        if(line_array[0]=="cell" ){
            if (!line_array.includes("outside")){
            let temp_array_metadata = [];
            let temp_array_surf_list = [];
            let name = line_array[1];
            let universe = line_array[2];

            let i;
            if (line_array.includes("fill")){
                let filling_material = line_array[4]; //filling_material = universe or pin
                temp_array_metadata.push(name, universe, filling_material);
                i = 5;
            } else{
                let material = line_array[3];
                temp_array_metadata.push(name, universe, material);
                i = 4;
            }
            
            while (line_array[i] != undefined){
                temp_array_surf_list.push(line_array[i]);
                i++;
            }
            if (line_array.includes("fill")){
                this.filled_cell_array.push([temp_array_metadata, temp_array_surf_list]);
            } else{
                this.cell_array.push([temp_array_metadata, temp_array_surf_list]);
            }

            }

        }
        

        
        
    }

    fill_universe_array(){
        for (let cell of this.cell_array){
            let universe = cell[0][1];
            if (!this.universe_array.includes(universe)){
                this.universe_array.push(universe);
            }
        }
        for (let cell of this.filled_cell_array){
            let universe = cell[0][1];
            if (!this.universe_array.includes(universe)){
                this.universe_array.push(universe);
            }
        }
        this.universe_array.sort();
        console.log("universe_array", this.universe_array);
    }

    lattice_reading(text){
        let lines = text.split('\n');
        for(let i = 0; i < lines.length ; i++){
            let line_array = lines[i].split(/\s+/);
            if (line_array[0] == "lat"){
                if (line_array[2] == "1"){ //circular lattice
                    this.cartesian_lattice_reading(lines, line_array, i);
                    console.log("cartesian_lattice_array", this.cartesian_lattice_array);
                } else if (line_array[2] == "4"){ //circular lattice
                    this.circular_lattice_reading(lines, line_array, i);
                    console.log("circular_lattice_array", this.circular_lattice_array);
                }
            }
        }        
    }

    cartesian_lattice_reading(lines, line_array, i){
        let universe = line_array[1];
        let x0 = parseFloat(line_array[3]);
        let y0 = parseFloat(line_array[4]);
        let nx = parseInt(line_array[5], 10);
        let ny = parseInt(line_array[6], 10);
        let pitch = parseFloat(line_array[7]);
        let meta_array = [];
        meta_array.push(universe, x0, y0, nx, ny, pitch);

        let local_lattice_array = [];
        for (let y = 1; y < ny + 1; y++){
            let local_lattice_array_line = [];            
            let local_line_array = lines[y + i].split(/\s+/);
            //console.log("local_line_array", local_line_array);
            for (let x = 0; x < nx ; x++){
                let pin = local_line_array[x];
                local_lattice_array_line.push(pin);
            }
            local_lattice_array.push(local_lattice_array_line);
        }        
        
        let sym_array = [];
        for (let line of lines){
            let local_line_array = line.split(/\s+/);
            //console.log(line);
            if (local_line_array[0] == "set" && local_line_array[1] == "usym" && local_line_array[2]== universe){
                let ax = parseInt(local_line_array[3],10);
                let bc = parseInt(local_line_array[4],10);
                let x0_sym = parseFloat(local_line_array[5]);
                let y0_sym = parseFloat(local_line_array[6]);
                let theta_0 = parseInt(local_line_array[7],10);
                let theta_width = parseInt(local_line_array[8],10);
                sym_array.push(ax, bc, x0_sym, y0_sym, theta_0, theta_width);
            }
        }

        this.cartesian_lattice_array.push([meta_array, local_lattice_array, sym_array]);

    }



    circular_lattice_reading(lines, line_array, i){
        let universe = line_array[1];
        let x0 = parseFloat(line_array[3]);
        let y0 = parseFloat(line_array[4]);
        let nr = parseInt(line_array[5], 10);
        let meta_array = [];
        meta_array.push(universe, x0, y0, nr);

        let multi_rings_array = []
        for (let j = 1; j < nr + 1; j++ ){
            let ring_array = [];
            let local_line_array = lines[i + j].split(/\s+/);
            let ns = parseInt(local_line_array[0], 10);
            let radius = parseFloat(local_line_array[1]);
            let angle = parseFloat(local_line_array[2]);
            ring_array.push(ns, radius, angle);
            for (let k=3; k < 3 + ns; k++){
                ring_array.push(local_line_array[k]);
            }
            multi_rings_array.push(ring_array);
            
        }
        this.circular_lattice_array.push([meta_array, multi_rings_array]);

    }
}
    
    
    



