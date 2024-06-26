const express= require('express')
const router=express.Router()
const Book = require('../models/book.model')

//MIDDLEWARE
const getBook= async (req,res,next)=>{
    let book;
    const {id}=req.params;
    if(!id.match(/^[0-9a-fA-F]{24}$/)){
       return res.status(404).json(
        {
            message: 'El Id del libro no es valido'
        }   
       ) 
    }
    try {
        book=await Book.findById(id);
        if(!book){
            return res.status(404).json(
                {
                    message: 'El libro no fue encontrado'
                }
            )
        }
    } catch (error) {
        return res.status(500).json(
            {
                message: error.message
            }
        )
    }
    res.book=book;
    next()
}
//obtener todos los libros 
router.get('/', async (req,res)=>{
    try{
        const books = await Book.find();
        console.log('GET ALL', books)
        if (books.length === 0) {
             return res.status(204).json([])
        }
        res.json(books)
    }catch(error){
        res.status(500).json({message: error.message})
    }
})
//crear un nuevo libro(recurso) [POST]
router.post('/', async(req, res)=>{
    const {title,author,genre,publicatio_date }=req?.body
    if( !title || !author || !genre || !publicatio_date){
        return res.status(400).json({
            message: 'Los campos titulo, autor, genero y fecha son obligatorios'
        })
    }
    const book = new Book(
        {
            title,
            author,
            genre,
            publicatio_date
        }
    )
    try {
        const newBook = await book.save()
        console.log(newBook)
        res.status(201).json(newBook)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })
    }
})
router.get('/:id', getBook, async(req,res) =>{
    res.json(res.book)
})
router.put('/:id', getBook, async(req,res) =>{
    try {
        const book = res.book //recupera datos de un libro mediante get
        // si se manda algo desde el body se modifica, sino de mantiene el dato
        book.title=req.body.title || book.title;
        book.author=req.body.author || book.author;
        book.genre=req.body.genre || book.genre;
        book.publicatio_date=req.body.publicatio_date || book.publicatio_date;
        const updateBooks= await book.save()
        res.json(updateBooks)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })        
    }
})
router.patch('/:id', getBook, async(req,res) =>{
    if (!req.body.title && !req.body.author && !req.body.genre && !req.body.publicatio_date ) {
        res.status(400).json({
            message:'Al menos uno de estos campos debe ser enviado: titulo, autor, genero, fecha publicacion'
        })   
    }
    try {
        const book = res.book //recupera datos de un libro mediante get
        // si se manda algo desde el body se modifica, sino de mantiene el dato
        book.title=req.body.title || book.title;
        book.author=req.body.author || book.author;
        book.genre=req.body.genre || book.genre;
        book.publicatio_date=req.body.publicatio_date || book.publicatio_date;
        const updateBooks= await book.save()
        res.json(updateBooks)
    } catch (error) {
        res.status(400).json({
            message: error.message
        })        
    }
})
router.delete('/:id', getBook, async(req,res) =>{
    try {
        const book=res.book
        await book.deleteOne({
            _id: book._id
        });
        res.json({
            message:`el libro ${book.title} fue eliminado exitosamente`
        })
    } catch (error) {
        res.status(500).json({
            message: error.message
        })
        
    }
    
})
module.exports =router