
/**
 * https://github.com/gkjohnson/ply-exporter-js
 *
 * Usage:
 *  const exporter = new PLYExporter();
 *
 *  // second argument is a list of options
 *  exporter.parse(mesh, data => console.log(data), { binary: true, excludeAttributes: [ 'color' ], littleEndian: true });
 *
 * Format Definition:
 * http://paulbourke.net/dataformats/ply/
 */

class PLYExporter {
	constructor(){
		this.includeIndices = false;
		this.includeNormals = false;
		this.includeColors = false;
		this.includeUVs = false;
		this.vertexCount = 0;
		this.faceCount = 0;
		this.mesh_transparence = false;

		// Default options
		this.defaultOptions = {
			binary: false,
			excludeAttributes: [], // normal, uv, color, index
			littleEndian: false
		};
	}
	

	initialize_datas(object){
		object.traverse( function( child ) {
			if ( child.isMesh === true ) {
				let material = child.material;
				this.mesh_transparence = (material.transparent == true && material.opacity == 0)? true : false;
				//console.log("mesh_transparence : ", this.mesh_transparence, child.name);
				if ( !this.mesh_transparence) {		
					const mesh = child;
					const geometry = mesh.geometry;
					if ( geometry.isBufferGeometry !== true ) {
						throw new Error( 'THREE.PLYExporter: Geometry is not of type THREE.BufferGeometry.' );
					}
					const vertices = geometry.getAttribute( 'position' );
					const normals = geometry.getAttribute( 'normal' );
					const uvs = geometry.getAttribute( 'uv' );					
					const colors = mesh.material.color; 					
					const indices = geometry.getIndex();
					if ( vertices === undefined ) {
						return;
					}
					this.vertexCount += vertices.count;
					this.faceCount += indices ? indices.count / 3 : vertices.count / 3;
					if ( normals !== undefined ) this.includeNormals = true;
					if ( uvs !== undefined ) this.includeUVs = true;
					if ( colors !== undefined ) this.includeColors = true;
				}

			}

		}.bind(this) );
	}


	generate_header(options){
		let header =
		'ply\n' +
		`format ${ options.binary ? ( options.littleEndian ? 'binary_little_endian' : 'binary_big_endian' ) : 'ascii' } 1.0\n` +
		`element vertex ${this.vertexCount}\n` +

		// position
		'property float x\n' +
		'property float y\n' +
		'property float z\n';

		if ( this.includeNormals === true ) {

			// normal
			header +=
				'property float nx\n' +
				'property float ny\n' +
				'property float nz\n';

		}

		if ( this.includeUVs === true ) {

			// uvs
			header +=
				'property float s\n' +
				'property float t\n';

		}

		if ( this.includeColors === true ) {
			//console.log("AV includecolors :", includeColors);
			// colors
			header +=
				'property uchar red\n' +
				'property uchar green\n' +
				'property uchar blue\n';

		}

		if ( this.includeIndices === true ) {

			// faces
			header +=
				`element face ${this.faceCount}\n` +
				'property list uchar int vertex_index\n';

		}

		header += 'end_header\n';

		return header;
	}

	
	traverseMeshes(object, cb ) {
		// Iterate over the valid meshes in the object
		object.traverse( function ( child ) {
			if ( child.isMesh === true ) {
				const mesh = child;
				const geometry = mesh.geometry;
				if ( geometry.isBufferGeometry !== true ) {
					throw new Error( 'THREE.PLYExporter: Geometry is not of type THREE.BufferGeometry.' );
				}
				if ( geometry.hasAttribute( 'position' ) === true) {
					cb( mesh, geometry );
				} 
			}
		} );
	}

	get_mesh_datas_binary(options, object, header){
		const indexByteCount = 4;
		const vertex = new THREE.Vector3();
		const normalMatrixWorld = new THREE.Matrix3();
		let result = null;
		var tempColor = new THREE.Color(); //AV

			// Binary File Generation
			const headerBin = new TextEncoder().encode( header );

			// 3 position values at 4 bytes
			// 3 normal values at 4 bytes
			// 3 color channels with 1 byte
			// 2 uv values at 4 bytes
			const vertexListLength = this.vertexCount * ( 4 * 3 + ( this.includeNormals ? 4 * 3 : 0 ) + ( this.includeColors ? 3 : 0 ) + ( this.includeUVs ? 4 * 2 : 0 ) );

			// 1 byte shape desciptor
			// 3 vertex indices at ${indexByteCount} bytes
			const faceListLength = this.includeIndices ? this.faceCount * ( indexByteCount * 3 + 1 ) : 0;
			const output = new DataView( new ArrayBuffer( headerBin.length + vertexListLength + faceListLength ) );
			new Uint8Array( output.buffer ).set( headerBin, 0 );


			let vOffset = headerBin.length;
			let fOffset = headerBin.length + vertexListLength;
			let writtenVertices = 0;
			this.traverseMeshes(object, function ( mesh, geometry ) {

				const vertices = geometry.getAttribute( 'position' );
				const normals = geometry.getAttribute( 'normal' );
				const uvs = geometry.getAttribute( 'uv' );

				const colors = mesh.material.color; // AV
				//const colors = geometry.getAttribute( 'color' );


				const indices = geometry.getIndex();

				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				for ( let i = 0, l = vertices.count; i < l; i ++ ) {
					

					vertex.fromBufferAttribute( vertices, i );

					vertex.applyMatrix4( mesh.matrixWorld );


					// Position information
					output.setFloat32( vOffset, vertex.x, options.littleEndian );
					vOffset += 4;

					output.setFloat32( vOffset, vertex.y, options.littleEndian );
					vOffset += 4;

					output.setFloat32( vOffset, vertex.z, options.littleEndian );
					vOffset += 4;

					// Normal information
					if ( this.includeNormals === true ) {

						if ( normals != null ) {

							vertex.fromBufferAttribute( normals, i );

							vertex.applyMatrix3( normalMatrixWorld ).normalize();

							output.setFloat32( vOffset, vertex.x, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, vertex.y, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, vertex.z, options.littleEndian );
							vOffset += 4;

						} else {

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

						}

					}

					// UV information
					if ( this.includeUVs === true ) {

						if ( uvs != null ) {

							output.setFloat32( vOffset, uvs.getX( i ), options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, uvs.getY( i ), options.littleEndian );
							vOffset += 4;

						} else {

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

							output.setFloat32( vOffset, 0, options.littleEndian );
							vOffset += 4;

						}

					}

					// Color information
					if ( this.includeColors === true ) {
						
						//console.log(colors);

						if ( colors != null ) {
							
							/*
							tempColor
								.fromBufferAttribute( colors, i )
								.convertLinearToSRGB();
							*/
							tempColor = colors; //AV

							output.setUint8( vOffset, Math.floor( tempColor.r * 255 ) );
							vOffset += 1;

							output.setUint8( vOffset, Math.floor( tempColor.g * 255 ) );
							vOffset += 1;

							output.setUint8( vOffset, Math.floor( tempColor.b * 255 ) );
							vOffset += 1;

						} else {

							output.setUint8( vOffset, 255 );
							vOffset += 1;

							output.setUint8( vOffset, 255 );
							vOffset += 1;

							output.setUint8( vOffset, 255 );
							vOffset += 1;

						}

					}

				}

				if ( this.includeIndices === true ) {

					// Create the face list

					if ( indices !== null ) {

						for ( let i = 0, l = indices.count; i < l; i += 3 ) {

							output.setUint8( fOffset, 3 );
							fOffset += 1;

							output.setUint32( fOffset, indices.getX( i + 0 ) + writtenVertices, options.littleEndian );
							fOffset += indexByteCount;

							output.setUint32( fOffset, indices.getX( i + 1 ) + writtenVertices, options.littleEndian );
							fOffset += indexByteCount;

							output.setUint32( fOffset, indices.getX( i + 2 ) + writtenVertices, options.littleEndian );
							fOffset += indexByteCount;

						}

					} else {

						for ( let i = 0, l = vertices.count; i < l; i += 3 ) {

							output.setUint8( fOffset, 3 );
							fOffset += 1;

							output.setUint32( fOffset, writtenVertices + i, options.littleEndian );
							fOffset += indexByteCount;

							output.setUint32( fOffset, writtenVertices + i + 1, options.littleEndian );
							fOffset += indexByteCount;

							output.setUint32( fOffset, writtenVertices + i + 2, options.littleEndian );
							fOffset += indexByteCount;

						}

					}

				}


				// Save the amount of verts we've already written so we can offset
				// the face index on the next mesh
				writtenVertices += vertices.count;

			}.bind(this) );

			result = output.buffer;
			return result;
	}

	
	get_mesh_datas(object, header){
		let result_array = [];
		result_array.push(header);

		const vertex = new THREE.Vector3();
		const normalMatrixWorld = new THREE.Matrix3();
		//let result = null;
		
		var tempColor = new THREE.Color(); //AV
	
		// Ascii File Generation
		// count the number of vertices
		let writtenVertices = 0;
		//let vertexList = [];
		//let faceList = '';
		let faceList = [];

		this.traverseMeshes(object, function ( mesh, geometry ) {
			console.log("exporting mesh ", mesh.name);
			this.mesh_transparence = (mesh.material.transparent == true && mesh.material.opacity == 0)? true : false;
			
			if (!this.mesh_transparence){

				const vertices = geometry.getAttribute( 'position' );
				const normals = geometry.getAttribute( 'normal' );
				const uvs = geometry.getAttribute( 'uv' );
				
				//const colors = geometry.getAttribute( 'color' );
				const colors = mesh.material.color; // AV

				const indices = geometry.getIndex();

				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				// form each line
				console.log("exporting vertex of this mesh");
				for ( let i2 = 0, l = vertices.count; i2 < l; i2 ++ ) {

					vertex.fromBufferAttribute( vertices, i2 );

					vertex.applyMatrix4( mesh.matrixWorld );


					// Position information
					let line =
						vertex.x + ' ' +
						vertex.y + ' ' +
						vertex.z;

					// Normal information
					if ( this.includeNormals === true ) {

						if ( normals != null ) {

							vertex.fromBufferAttribute( normals, i2 );

							vertex.applyMatrix3( normalMatrixWorld ).normalize();

							line += ' ' +
								vertex.x + ' ' +
								vertex.y + ' ' +
								vertex.z;

						} else {

							line += ' 0 0 0';

						}

					}

					// UV information
					if ( this.includeUVs === true ) {

						if ( uvs != null ) {

							line += ' ' +
								uvs.getX( i2 ) + ' ' +
								uvs.getY( i2 );

						} else {

							line += ' 0 0';

						}

					}

					// Color information
					if ( this.includeColors === true ) {
						if ( colors != null ) {
							tempColor = colors; 

							line += ' ' +
								Math.floor( tempColor.r * 255 ) + ' ' +
								Math.floor( tempColor.g * 255 ) + ' ' +
								Math.floor( tempColor.b * 255 );

						} else {

							line += ' 255 255 255';

						}

					}
					
					//vertexList.push(line + '\n');						
					result_array.push(line + '\n');

				}

				// Create the face list
				console.log("exporting faces of this mesh");
				if ( this.includeIndices === true ) {
					

					if ( indices !== null ) {
						for ( let i = 0, l = indices.count; i < l; i += 3 ) {
							let face_line = '';
							/*
							faceList += `3 ${ indices.getX( i + 0 ) + writtenVertices }`;
							faceList += ` ${ indices.getX( i + 1 ) + writtenVertices }`;
							faceList += ` ${ indices.getX( i + 2 ) + writtenVertices }\n`;
							*/

							face_line += `3 ${ indices.getX( i + 0 ) + writtenVertices }`;
							face_line += ` ${ indices.getX( i + 1 ) + writtenVertices }`;
							face_line += ` ${ indices.getX( i + 2 ) + writtenVertices }\n`;
							faceList.push(face_line);

						}

					} else {

						for ( let i = 0, l = vertices.count; i < l; i += 3 ) {
							//faceList += `3 ${ writtenVertices + i } ${ writtenVertices + i + 1 } ${ writtenVertices + i + 2 }\n`;
							faceList.push(`3 ${ writtenVertices + i } ${ writtenVertices + i + 1 } ${ writtenVertices + i + 2 }\n`);

						}

					}

					this.faceCount += indices ? indices.count / 3 : vertices.count / 3;

				}

				writtenVertices += vertices.count;
			
			
			}
			



		}.bind(this) );

		

		
		if (this.includeIndices){
			result_array = result_array.concat(faceList);
			/*

			for (let face of faceList){
				result_array.push(face);
			}
			*/
		}
		
		result_array.push('\n');

		return result_array;
	}


	parse( object, onDone, options ) {

		if ( onDone && typeof onDone === 'object' ) {
			console.warn( 'THREE.PLYExporter: The options parameter is now the third argument to the "parse" function. See the documentation for the new API.' );
			options = onDone;
			onDone = undefined;
		}		

		options = Object.assign( this.defaultOptions, options );
		const excludeAttributes = options.excludeAttributes;
		
		this.initialize_datas(object);
		this.includeIndices = excludeAttributes.indexOf( 'index' ) === - 1;
		this.includeNormals = this.includeNormals && excludeAttributes.indexOf( 'normal' ) === - 1;
		this.includeColors = this.includeColors && excludeAttributes.indexOf( 'color' ) === - 1;
		this.includeUVs = this.includeUVs && excludeAttributes.indexOf( 'uv' ) === - 1;


		if ( this.includeIndices && this.faceCount !== Math.floor( this.faceCount ) ) {
			// point cloud meshes will not have an index array and may not have a
			// number of vertices that is divisble by 3 (and therefore representable
			// as triangles)
			console.error(

				'PLYExporter: Failed to generate a valid PLY file with triangle indices because the ' +
				'number of indices is not divisible by 3.'

			);
			return null;

		}

		
		let header = this.generate_header(options);
		let result;		
		if ( options.binary === true ) {
			result = this.get_mesh_datas_binary(options, object, header);
		} else {
			result = this.get_mesh_datas(object, header);
		}
		

		if ( typeof onDone === 'function' ) requestAnimationFrame( () => onDone( result ) );

		return result;

	}


	get_mesh_datas_2(mesh_array, header){
		const vertex_List = [];		
		const vertex = new THREE.Vector3();
		const normalMatrixWorld = new THREE.Matrix3();	
		let writtenVertices = 0;
		let faceList = [];

		let i = 0;
		console.log("mesh_array.length", mesh_array.length);
		for (let mesh of mesh_array) {
			const geometry = mesh.geometry;
			console.log("exporting mesh n°", i , " ", mesh.name);
			i++;
			this.mesh_transparence = (mesh.material.transparent == true && mesh.material.opacity == 0)? true : false;
			
			if (!this.mesh_transparence){
				const vertices = geometry.getAttribute( 'position' );
				const normals = geometry.getAttribute( 'normal' );
				const uvs = geometry.getAttribute( 'uv' );
				const colors = mesh.material.color; 
				const indices = geometry.getIndex();
				normalMatrixWorld.getNormalMatrix( mesh.matrixWorld );

				// form each line
				console.log("exporting vertex of this mesh");
				for ( let i2 = 0, l = vertices.count; i2 < l; i2 ++ ) {
					vertex.fromBufferAttribute( vertices, i2 );
					vertex.applyMatrix4( mesh.matrixWorld );

					// Position information
					let line =
						vertex.x + ' ' +
						vertex.y + ' ' +
						vertex.z;

					// Normal information
					
					if ( this.includeNormals === true ) {
						//for now we work without this spec for RAM efficiency.
						/*
						if ( normals != null ) {
							vertex.fromBufferAttribute( normals, i2 );
							vertex.applyMatrix3( normalMatrixWorld ).normalize();
							line += ' ' +
								vertex.x + ' ' +
								vertex.y + ' ' +
								vertex.z;
						} else {
							line += ' 0 0 0';
						}
						*/

						line += ' 0 0 0';

					}
					
					

					// UV information
					if ( this.includeUVs === true ) {
						//for now we work without this spec for RAM efficiency.
						/*
						if ( uvs != null ) {
							line += ' ' +
								uvs.getX( i2 ) + ' ' +
								uvs.getY( i2 );
						} else {
							line += ' 0 0';
						}
						*/
						line += ' 0 0';
					}
					// Color information
					if ( this.includeColors === true ) {
						if ( colors != null ) {
							line += ' ' +
								Math.floor( colors.r * 255 ) + ' ' +
								Math.floor( colors.g * 255 ) + ' ' +
								Math.floor( colors.b * 255 );
						} else {
							line += ' 255 255 255';
						}

					}
										
					vertex_List.push(line + '\n');

				}

				// Create the face list
				console.log("exporting faces of this mesh");
				if ( this.includeIndices === true ) {				

					if ( indices !== null ) {
						for ( let i = 0, l = indices.count; i < l; i += 3 ) {
							let face_line = '3 ';
							face_line += indices.getX( i + 0 ) + writtenVertices + ' ';
							face_line += indices.getX( i + 1 ) + writtenVertices + ' ';
							face_line += indices.getX( i + 2 ) + writtenVertices +'\n';
							faceList.push(face_line);
						}

					} else {
						for ( let i = 0, l = vertices.count; i < l; i += 3 ) {
							faceList.push('3 ' + (writtenVertices + i) + ' '+ (writtenVertices + i + 1) + ' ' + (writtenVertices + i + 2) + ' \n');
							
						}
					}
					this.faceCount += indices ? indices.count / 3 : vertices.count / 3;
				}
				writtenVertices += vertices.count;			
			}	
		}
		console.log("merging vertex and faces");
		let result_array = [];
		result_array.push(header);	
		result_array = result_array.concat(vertex_List);
		//console.log("vertex_List", vertex_List);
		if (this.includeIndices){
			result_array = result_array.concat(faceList);
		}		
		result_array.push('\n');
		return result_array;
	}

	parse_2( object, onDone, options ) {
		if ( onDone && typeof onDone === 'object' ) {
			console.warn( 'THREE.PLYExporter: The options parameter is now the third argument to the "parse" function. See the documentation for the new API.' );
			options = onDone;
			onDone = undefined;
		}
		options = Object.assign( this.defaultOptions, options );
		const excludeAttributes = options.excludeAttributes;
		
		this.initialize_datas(object);
		this.includeIndices = excludeAttributes.indexOf( 'index' ) === - 1;
		this.includeNormals = this.includeNormals && excludeAttributes.indexOf( 'normal' ) === - 1;
		this.includeColors = this.includeColors && excludeAttributes.indexOf( 'color' ) === - 1;
		this.includeUVs = this.includeUVs && excludeAttributes.indexOf( 'uv' ) === - 1;


		if ( this.includeIndices && this.faceCount !== Math.floor( this.faceCount ) ) {
			// point cloud meshes will not have an index array and may not have a
			// number of vertices that is divisble by 3 (and therefore representable
			// as triangles)
			console.error(
				'PLYExporter: Failed to generate a valid PLY file with triangle indices because the ' +
				'number of indices is not divisible by 3.'
			);
			return null;
		}

		
		
		let header = this.generate_header(options);
		let result;		
		if ( options.binary === true ) {
			result = this.get_mesh_datas_binary(options, object, header);
		} else {

			let mesh_array_2 = [];
			this.traverseMeshes(object, function ( mesh, geometry ) {
				//console.log("pushing mesh ", mesh.name);
				mesh_array_2.push(mesh);	
			}.bind(this) );
			//console.log("mesh_array_2",mesh_array_2);


			result = this.get_mesh_datas_2(mesh_array_2, header);
		}
		

		//if ( typeof onDone === 'function' ) requestAnimationFrame( () => onDone( result ) );

		return result;

	}

}

