
class surface{
	constructor(id, type, coeff){
        this.id = id;
        this.type = type;
        this.coeff = coeff;
	}

	
	includes(x, y, z, in_or_out){
                
                if (this.type == "x-plane"){
                        //console.log(in_or_out);
                        //console.log(x);
                        //console.log(this.coeff);
                        //console.log(typeof(x));
                        //console.log(typeof(this.coeff));
                        if (in_or_out == "-" && x < this.coeff){
                             return true;
                        } else if (in_or_out == "+" && x > this.coeff){
                                return true;
                        } else {
                                return false;
                        }
                }

                if (this.type == "y-plane"){
                        if (in_or_out == "-" && y < this.coeff){
                             return true;
                        }
                        if (in_or_out == "+" && y > this.coeff){
                                return true;
                        }
                        return false;
                }

                if (this.type == "z-plane"){
                        if (in_or_out == "-" && z < this.coeff){
                             return true;
                        }
                        if (in_or_out == "+" && z > this.coeff){
                                return true;
                        }
                        return false;
                }

        }

	


}
