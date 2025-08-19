export const  get404 = ( req, res ) => {
        res.render( 'error/404' )
    }

export const     get500 = ( req, res ) => {
        res.render( 'error/500' )
    }