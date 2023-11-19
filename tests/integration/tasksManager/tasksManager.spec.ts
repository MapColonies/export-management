import jsLogger from '@map-colonies/js-logger';
import { trace } from '@opentelemetry/api';
import httpStatusCodes from 'http-status-codes';
import { getApp } from '../../../src/app';
import { SERVICES } from '../../../src/common/constants';
import { AnotherResourceRequestSender } from './helpers/requestSender';

describe('resourceName', function () {
  let requestSender: AnotherResourceRequestSender;
  beforeEach(function () {
    const app = getApp({
      override: [
        { token: SERVICES.LOGGER, provider: { useValue: jsLogger({ enabled: false }) } },
        { token: SERVICES.TRACER, provider: { useValue: trace.getTracer('testTracer') } },
      ],
      useChild: true,
    });
    requestSender = new AnotherResourceRequestSender(app);
  });

  describe('Happy Path', function () {
    describe('POST /export-tasks', function () {
      it('should return 201 status code and the resource', async function () {
        const req = { ...exportRequest };

        const response = await requestSender.createTask(req);

        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        //expect(response).toSatisfyApiSpec();
      });

      it('should return 201 status code and the cached resource', async function () {
        saveSpy = jest.spyOn(repo, 'save');
        const req = { ...exportRequest };

        const response = await requestSender.createTask(req);

        expect(response.status).toBe(httpStatusCodes.CREATED);
        expect(saveSpy).toHaveBeenCalledTimes(1);
        //expect(response).toSatisfyApiSpec();
      });
    });

    describe('GET /export-tasks', function () {
      it('should return 200 status code and the resource', async function () {
        const res = await requestSender.getLatestTasksByLimit(1);

        expect(res).toHaveProperty('status', httpStatusCodes.OK);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        expect(JSON.parse(res.text)).toHaveLength(1);
        //expect(res).toSatisfyApiSpec();
      });

      it('should return 200 status code and an empty array', async function () {
        findSpy.mockResolvedValue([]);

        const res = await requestSender.getLatestTasksByLimit(1);

        expect(findSpy).toHaveBeenCalledTimes(1);
        expect(res).toHaveProperty('status', httpStatusCodes.OK);
        expect(JSON.parse(res.text)).toHaveLength(0);
        //expect(res).toSatisfyApiSpec();
      });
    });

    describe('GET /export-tasks/:taskId', function () {
      describe('Happy Path', function () {
        it('should return 200 status code and the resource', async function () {
          const res = await requestSender.getTaskById(1);

          expect(res).toHaveProperty('status', httpStatusCodes.OK);
          expect((res.body as unknown as TaskEntity).id).toBe(1);
          //expect(res).toSatisfyApiSpec();
        });
      });
    });
  });
  
  describe('Bad Path', function () {
    // All requests with status code of 400
    describe('POST /export-tasks', function () {
      it('should return 400 status code due to unsupported domain', async function () {
        const req = { ...exportRequest };
        req.domain = Domain.DEM;
        const response = await requestSender.createTask(req);

        expect(response.status).toBe(httpStatusCodes.BAD_REQUEST);
        //expect(response).toSatisfyApiSpec(); // TODO: use when tests are done
      });
    });

    describe('GET /export-tasks/:taskId', function () {
      it('should return 404 status code if id is not exists', async function () {
        const res = await requestSender.getTaskById(150);

        expect(res).toHaveProperty('status', httpStatusCodes.NOT_FOUND);
        //expect(res).toSatisfyApiSpec();
      });
    });
  });

  describe('Sad Path', function () {
    // All requests with status code 4XX-5XX
    describe('POST /export-tasks', function () {
      it('should return 500 status code if db throws an error', async function () {
        const req = { ...exportRequest };
        saveSpy.mockRejectedValue(new Error());

        const res = await requestSender.createTask(req);

        expect(res).toHaveProperty('status', httpStatusCodes.INTERNAL_SERVER_ERROR);
        //expect(res).toSatisfyApiSpec();
      });
    });

    describe('GET /export-tasks/:taskId', function () {
      it('should return 500 status code if db throws an error', async function () {
        findOneSpy.mockRejectedValue(new Error());

        const res = await requestSender.getTaskById(1);

        expect(findOneSpy).toHaveBeenCalledTimes(1);
        expect(res).toHaveProperty('status', httpStatusCodes.INTERNAL_SERVER_ERROR);
        //expect(res).toSatisfyApiSpec();
      });
    });

    describe('GET /export-tasks', function () {
      it('should return 500 status code if db throws an error', async function () {
        findSpy.mockRejectedValue(new Error());

        const res = await requestSender.getLatestTasksByLimit(1);

        expect(res).toHaveProperty('status', httpStatusCodes.INTERNAL_SERVER_ERROR);
        //expect(res).toSatisfyApiSpec();
      });
    });
  });
});
