class plane{
	constructor(a, b, c, d){
        this.a = a;
        this.b = b;
        this.c = c;
        this.d = d;
        this.id;
        this.type;
	}

    includes(tested_vector, sign){
        let test = this.a * tested_vector.x + this.b * tested_vector.y + this.c * tested_vector.z + this.d;

        if (sign == -1){
            if (test <= 0){
                return true;
            } 
            if (test > 0){
                return false;
            }
        }

        if (sign == 1){
            if (test < 0){
                return false;
            } 
            if (test >= 0){
                return true;
            }
        }

    }
}