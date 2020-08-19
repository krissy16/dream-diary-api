const path = require('path');
const express = require('express');
const xss = require('xss');
const DreamsService = require('./dreams-service');
const { requireAuth } = require('../middleware/jwt-auth')

const dreamRouter = express.Router();
const jsonParser = express.json();

const serializeDream = dream => ({
    id: dream.id,
    title: xss(dream.title),
    date_created: dream.date_created,
    content: xss(dream.content),
    notes: xss(dream.notes),
    user_id: dream.user_id
});

dreamRouter
    .route('/')
    .all(requireAuth)
    .get( (req, res, next) => {
        const knexInstance = req.app.get('db');
        DreamsService.getAllDreams(knexInstance)
            .then(dreams => {
                res.json(dreams.map(serializeDream))
            })
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const { title, date_created, content, notes } = req.body;
        const newDream = { title, date_created, content, notes }

        if(!title){
            return res.status(400).json({
                error: `Missing title in request body`
            })
        }
        if(!content){
            return res.status(400).json({
                error: `Missing dream content in request body`
            })
        }

        newDream.user_id = req.user.id

        DreamsService.insertDream(
            req.app.get('db'),
            newDream
        )
            .then(dream => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${dream.id}`))
                    .json(serializeDream(dream))
            })
            .catch(next);

    })

dreamRouter
    .route('/:dream_id')
    .all(requireAuth)
    .get( (req, res, next) => {
        DreamsService.getById(
            req.app.get('db'),
            req.params.dream_id
        )
            .then(dream => {
                if(!dream){
                    return res.status(404).json({
                        error: { message: `Dream doesn't exist` }
                    });
                }
                res.json(serializeDream(dream));
            })
            .catch(next);
    })
    .patch( jsonParser, (req, res, next) => {
        const { title, date_created, content, notes } = req.body;
        const updatedDream = { title, date_created, content, notes }

        const numberOfValues = Object.values(bookmarkToUpdate).filter(Boolean).length
            if(numberOfValues === 0) {
            return res.status(400).json({
                error: {
                message: `Request body must contain either 'title', 'date_created', 'content' or 'notes'`
                }
            })
        }

        DreamsService.updateDream(
            req.app.get('db'),
            req.params.dream_id,
            updatedDream
        )
          .then(numRowsAffected => {
            res.status(204).end()
          })
          .catch(next)
    })

dreamRouter
    .route('/byUserId/:user_id')
    .all(requireAuth)
    .get( (req, res, next) => {
        DreamsService.getByUserId(
            req.app.get('db'),
            req.params.user_id
        )
            .then(dreams => {
                if(!dreams){
                    return res.status(404).json({
                        error: { message: `User has no dreams` }
                    });
                }
                
                res.json(dreams.map(serializeDream));
            })
            .catch(next);
    })


module.exports = dreamRouter;