import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { isValidObjectId, Model } from 'mongoose';
import { Pokemon } from './entities/pokemon.entity';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PokemonService {

  constructor(

    @InjectModel('Pokemon')
    private readonly pokemonModel:Model<Pokemon>


  ) {}

  async create(createPokemonDto: CreatePokemonDto) {
     createPokemonDto.name = createPokemonDto.name.toLowerCase();
  
  try {
    const pokemon = await this.pokemonModel.create(createPokemonDto);
    return pokemon;
  } catch (e) {
    this.handleExceptions(e);
    }
  }

  findAll() {
    return `This action returns all pokemon`;
  }

  async findOne(term: string) {

    	let pokemon:Pokemon|null=null;  
      if(!isNaN(+term)){
        pokemon = await this.pokemonModel.findOne({no:term});
      }


      //Mongo ID
      if(!pokemon  && isValidObjectId(term)){
        pokemon = await this.pokemonModel.findById(term);
      }

      //Name
      if(!pokemon){
        pokemon = await this.pokemonModel.findOne({name:term.toLowerCase()});
      }

      if(!pokemon){
        throw new NotFoundException(`Pokemon with term ${term} not found`);
      }

    return pokemon;

  }

  async update(term: string, updatePokemonDto: UpdatePokemonDto) {
    
    const pokemon = await this.findOne(term);

    if(updatePokemonDto.name){
      updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
    }

    try{

      await pokemon.updateOne(updatePokemonDto);
      return {...pokemon.toObject(),...updatePokemonDto};
    }
    catch (e) {
      this.handleExceptions(e);
      
    }

  }

  async remove(id: string) {
    //const pokemon=await this.findOne(id);
    //await pokemon.deleteOne();
   // const result = await this.pokemonModel.findByIdAndDelete(id);

    const {deletedCount} = await this.pokemonModel.deleteOne({_id:id});
    
    if(deletedCount===0){
      throw new NotFoundException(`Pokemon with id ${id} not found`);
    }
    
    return;
  }




  private handleExceptions(error:any){
    if (error.code === 11000) { // Error de duplicado en MongoDB
      throw new BadRequestException(
        `Pokemon with name or number ${JSON.stringify(error.keyValue)} already exists`,
      );
    }
    console.error('Error updating Pokemon:', error);
    throw new InternalServerErrorException('Cannot update Pokemon. Check the logs');


  }
}
