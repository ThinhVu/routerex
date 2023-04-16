const Router = require('./index');
const yup = require('yup');

describe('routerex', function () {
  it('should add empty object metadata if metadata is not provided', function () {
    const r = Router()
    r.get('/', () => {})
    expect(r.stack[r.stack.length - 1].route.metadata).toEqual({});
  })

  it('should attach metadata to last stack of current route', function () {
    const metadata = {schema: {}}
    const r = Router()
    r.get('/', metadata, () => {})
    expect(r.stack[r.stack.length - 1].route.metadata).toBe(metadata);
  })

  describe('validate input', function () {
    const r = Router({yup: true})
    const metadata = {
      schema: yup.object({
        params: yup.object({
          id: yup.number().required(),
        }),
        body: yup.object({
          name: yup.string().required()
        })
      })
    }
    const mockRes = {send: jest.fn((data) => data)}
    const reqHandler = jest.fn((req, res, next) => {
      res.send('OK')
      next()
    })
    r.get('/update/:id', metadata, reqHandler)

    it('should pass validate input', function (done) {
      const mockReq = {method: 'GET', url: '/update/1', body: {name: 'test'}}
      r.handle(mockReq, mockRes, err => {
        expect(err).toBe(undefined) // no error
        expect(reqHandler).toBeCalledTimes(1) // pass yup validate middleware
        expect(mockRes.send).toBeCalledTimes(1)
        expect(mockRes.send.mock.calls[0][0]).toBe('OK')
        done()
      })
    })

    it('should fail if missing body.name', function (done) {
      const mockReq = {method: 'GET', url: '/update/1', body: {}}
      r.get('/update/:id', metadata, reqHandler)
      r.handle(mockReq, mockRes, err => {
        expect(err).not.toBe(undefined) // has error
        expect(err.message).toBe('body.name is a required field')
        done()
      })
    })

    it('should fail if invalid params.id', function (done) {
      const mockReq = {method: 'GET', url: '/update/a', body: {name: 'josh'}}
      r.handle(mockReq, mockRes, err => {
        expect(err).not.toBe(undefined) // has error
        expect(err.message).toBe("params.id must be a `number` type, but the final value was: `NaN` (cast from the value `\"a\"`).")
        done()
      })
    })
  });

  describe('skip validate input', function (){
    it('should pass', function (done) {
      const r = Router()
      const metadata = {
        schema: yup.object({
          params: yup.object({
            id: yup.number().required(),
          }),
          body: yup.object({
            name: yup.string().required()
          })
        })
      }
      const mockRes = {send: jest.fn((data) => data)}
      const reqHandler = jest.fn((req, res, next) => {
        res.send('OK')
        next()
      })
      r.get('/update/:id', metadata, reqHandler)
      const mockReq = {method: 'GET', url: '/update/a', body: {name: 5}}
      r.handle(mockReq, mockRes, err => {
        expect(err).toBe(undefined)
        expect(reqHandler).toBeCalledTimes(1)
        expect(mockRes.send).toBeCalledTimes(1)
        expect(mockRes.send.mock.calls[0][0]).toBe('OK')
        done()
      })
    })
  })
});
