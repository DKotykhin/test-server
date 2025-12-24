import * as chai from 'chai';
import { expect } from 'chai';
import chaiHttp from 'chai-http';
import { describe, it, before, after } from 'mocha';
import { type FastifyInstance } from 'fastify';

import { createServer } from '../src/server.js';

chai.use(chaiHttp);
chai.should();

describe('General API tests', () => {
  let server: FastifyInstance;

  before(async () => {
    server = await createServer();
    await server.ready(); // important: initialize routes/plugins, but don't listen
  });

  after(async () => {
    await server.close();
  });

  it('should return 200 for GET /health', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/health',
    });

    expect(res.statusCode).to.equal(200);
  });
  it('should return status ok for GET /health', async () => {
    const res = await server.inject({
      method: 'GET',
      url: '/health',
    });

    // expect(res.json()).to.deep.equal({ status: 'ok' });
    expect(res.json()).to.have.property('status', 'ok');
  });
});
