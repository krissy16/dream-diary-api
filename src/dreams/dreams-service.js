const DreamsService = {
    getAllDreams(knex){
        return knex.select('*').from('dreams');
    },
    insertDream(knex, newDream){
        return knex
            .insert(newDream)
            .into('dreams')
            .returning('*')
            .then(rows => {
              return rows[0]
            });
    },
    getById(knex, id) {
        return knex
          .from('dreams')
          .select('*')
          .where('id', id)
          .first();
    },
    getByUserId(knex, id){
        return knex
          .select('*')
          .from('dreams')
          .where('user_id', id);
    },
    deleteDream(knex, id) {
        return knex('dreams')
          .where({ id })
          .delete();
    },
    updateDream(knex, id, newDream) {
        return knex('dreams')
          .where({ id })
          .update(newDream);
    },
};

module.exports = DreamsService;