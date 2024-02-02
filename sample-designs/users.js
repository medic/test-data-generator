import { faker } from '@faker-js/faker';
import { v4 as uuid } from 'uuid';

const getTelemetryMetric = () => ({
  sum: faker.number.float(50000),
  min: faker.number.float(1000),
  max: faker.number.float({ min: 1000, max: 50000 }),
  count: faker.number.int(100),
  sumsqr: faker.number.float(999999999)
});

const getUserAgent = () => {
  const systemInformation = faker.helpers.arrayElement([
    'Macintosh; Intel Mac OS X; U; en',
    'Windows NT 6.1; Win64; x64 rv:47.0',
    'X11; Linux x86_64'
  ]);
  const platform = faker.helpers.arrayElement([
    'Gecko/20100101 Firefox/47.0',
    'AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ]);
  return `Mozilla/5.0 (${systemInformation}) ${platform}`;
};

const getTelemetryDoc = (user, deviceId) => {
  const telDateRaw = faker.date.recent({ days: 365 * 20 });
  const year = telDateRaw.getFullYear();
  const month = telDateRaw.getMonth();
  const day = telDateRaw.getDay();
  const telDateFormatted = `${year}-${month}-${day}`;
  return {
    _id: `telemetry-${telDateFormatted}-${user}-${deviceId}`,
    type: 'telemetry',
    metrics: {
      boot_time: getTelemetryMetric(),
      'boot_time:1:to_first_code_execution': getTelemetryMetric(),
      'boot_time:2:to_bootstrap': getTelemetryMetric(),
      'boot_time:2_1:to_replication': getTelemetryMetric(),
      'boot_time:2_3:to_purge_meta': getTelemetryMetric(),
      'boot_time:3:to_angular_bootstrap': getTelemetryMetric(),
      'boot_time:purging_meta:false': getTelemetryMetric(),
      'boot_time:purging_meta:true': getTelemetryMetric(),
      'boot_time:purging_meta:undefined': getTelemetryMetric(),
      'enketo:contacts:enketo_widgets:add:render': getTelemetryMetric(),
      'enketo:contacts:form:contact:clinic:create:edit:render': getTelemetryMetric(),
      'enketo:contacts:form:contact:clinic:create:edit:save': getTelemetryMetric(),
      'enketo:contacts:form:contact:clinic:create:edit:user_edit_time': getTelemetryMetric(),
      'enketo:contacts:form:contact:district_hospital:create:edit:render': getTelemetryMetric(),
      'enketo:contacts:form:contact:district_hospital:create:edit:save': getTelemetryMetric(),
      'enketo:contacts:form:contact:district_hospital:create:edit:user_edit_time': getTelemetryMetric(),
      'enketo:contacts:form:contact:health_center:create:edit:render': getTelemetryMetric(),
      'enketo:contacts:form:contact:health_center:create:edit:save': getTelemetryMetric(),
      'enketo:contacts:form:contact:health_center:create:edit:user_edit_time': getTelemetryMetric(),
      'enketo:contacts:form:contact:person:create:edit:render': getTelemetryMetric(),
      'enketo:contacts:form:contact:person:create:edit:save': getTelemetryMetric(),
      'enketo:contacts:form:contact:person:create:edit:user_edit_time': getTelemetryMetric(),
      'enketo:contacts:pregnancy:add:render': getTelemetryMetric(),
      'enketo:contacts:pregnancy:add:save': getTelemetryMetric(),
      'enketo:contacts:pregnancy:add:user_edit_time': getTelemetryMetric(),
      'geolocation:failure:2': getTelemetryMetric(),
      'replication:medic:from:docs': getTelemetryMetric(),
      'replication:medic:from:ms-since-last-replicated-date': getTelemetryMetric(),
      'replication:medic:from:success': getTelemetryMetric(),
      'replication:medic:to:docs': getTelemetryMetric(),
      'replication:medic:to:ms-since-last-replicated-date': getTelemetryMetric(),
      'replication:medic:to:success': getTelemetryMetric(),
      'replication:meta:sync:docs': getTelemetryMetric(),
      'replication:meta:sync:success': getTelemetryMetric(),
      'replication:user-initiated': getTelemetryMetric(),
      'rules-engine:initialize': getTelemetryMetric(),
      'rules-engine:targets': getTelemetryMetric(),
      'rules-engine:targets:dirty-contacts': getTelemetryMetric(),
      'rules-engine:targets:queued': getTelemetryMetric(),
      'rules-engine:tasks:all-contacts': getTelemetryMetric(),
      'rules-engine:tasks:all-contacts:queued': getTelemetryMetric(),
      'rules-engine:tasks:dirty-contacts': getTelemetryMetric(),
      'rules-engine:tasks:some-contacts': getTelemetryMetric(),
      'rules-engine:tasks:some-contacts:queued': getTelemetryMetric(),
      'rules-engine:update-emissions': getTelemetryMetric(),
      'search:contacts:parent:search:types': getTelemetryMetric(),
      'search:contacts:parent:types': getTelemetryMetric(),
      'search:contacts:types': getTelemetryMetric(),
      'search:reports': getTelemetryMetric(),
      'search:reports:subjectIds': getTelemetryMetric(),
      'user_settings:language:en': getTelemetryMetric()
    },
    device: {
      userAgent: getUserAgent(),
      hardwareConcurrency: faker.number.int(20),
      screen: {
        width: faker.number.int(10000),
        height: faker.number.int(10000)
      },
      deviceInfo: {
        app: {
          version: `v${faker.system.semver()}`,
          packageName: `org.medicmobile.app.${faker.company.buzzNoun()}`,
          versionCode: faker.number.int(100)
        },
        software: {
          androidVersion: faker.number.int({ min: 5, max: 14 }),
          osAPILevel: faker.number.int({ min: 5, max: 14 }),
          osVersion: faker.system.semver(),
        },
        hardware: {
          device: faker.company.buzzNoun(),
          model: faker.company.buzzVerb(),
          manufacturer: faker.company.name(),
          hardware: faker.company.buzzPhrase(),
          cpuInfo: faker.company.catchPhrase(),
        },
        storage: {
          free: faker.number.float(100000000000),
          total: faker.number.float(100000000000)
        },
        ram: {
          free: faker.number.float(1000000),
          total: faker.number.float(100000),
          threshold: faker.number.float(1000000)
        }
      }
    },
    metadata: {
      year,
      month,
      day,
      user,
      deviceId,
      versions: {
        app: faker.system.semver(),
        forms: {
          'contact:clinic:create': '2-b4a613fb07f41b0533bf02f0957c3ad7',
          'contact:clinic:edit': '2-307ab4e051da7200cc70be1adee5c20e',
          'contact:district_hospital:create': '2-22f3653927dfa1cc0632f356b7412a11',
          'contact:district_hospital:edit': '2-6167ce747fbb52f2b3ff3ee8d9184717',
          'contact:health_center:create': '4-b77540a1eebeb8a882a9bec6515ed08f',
          'contact:health_center:edit': '2-4bd56835ca282357e482a400aef00b21',
          'contact:person:create': '4-d65531ed6fb76753d37204325c2c63e9',
          'contact:person:edit': '4-04070bf24161381b404f397062214e95',
          death_report: '2-488a01d051c82e183ee907b5ce0c9161',
          delivery: '2-5d785145321700b1c4d174b644673238',
          pnc_danger_sign_follow_up_baby: '2-7d863861c5b6636c326a3b9e8689cfaf',
          pnc_danger_sign_follow_up_mother: '2-ee752705c84cc043f6ea542040d2da87',
          pregnancy: '2-80babb50ec1bed2a2c40f7aac2aca6c1',
          pregnancy_danger_sign: '2-620951c021878b35fabcb689a28b4cc2',
          pregnancy_danger_sign_follow_up: '2-d89ed094e5ff69704a36fd04f85b2769',
          pregnancy_facility_visit_reminder: '2-9e976ec126984cf053022b76b5b6c099',
          pregnancy_home_visit: '2-18e01fd0efd9fa012b83694b2a0e5e9e',
          replace_user: '2-9be8e28a73c6426fef06e64f07e206ec',
          trigger_contact_task: '2-18a3ebda883e6ae7c79554868e039cee',
          undo_death_report: '2-9bbf9f49e441f4e561da7c027f3a2d3a'
        },
        settings: '1-4522ba75af889f038dc3c05f8527876a'
      }
    },
    dbInfo: {
      doc_count: faker.number.int(10000),
      update_seq: faker.number.int(10000),
      idb_attachment_format: 'binary',
      db_name: `medic-user-${user}`,
      auto_compaction: true,
      adapter: 'idb'
    }
  };
};

const getUserDoc = (parent, { username, roles, password }) => ({
  _id: `org.couchdb.user:${username}`,
  name: username,
  type: 'user',
  roles,
  facility_id: parent.parent._id,
  password,
});

const getUserSettingsDoc = (parent, { username, roles }) => ({
  _id: `org.couchdb.user:${username}`,
  name: username,
  type: 'user-settings',
  roles,
  facility_id: parent.parent._id,
  contact_id: parent._id,
  fullname: parent.name
});

const getUsername = (parent, username) => {
  const result = username || parent.username;
  if(!result) {
    throw new Error('A username value must be provided in the options or set on the parent contact.');
  }
  return result;
};

/**
 * Returns a design for creating telemetry data for a user.
 * @param providedOpts telemetry options:
 *   - `username` - Required.
 *   - `deviceId` - Default: `username-${uuid()}`
 *   - `amount` - Default: `1`
 * @returns a design for creating user telemetry data
 */
export const getTelemetryDesign = (providedOpts) => {
  const opts = { amount: 1, ...providedOpts };
  const defaultUUID = uuid();
  return {
    designId: `Telemetry`,
    db: 'medic-users-meta',
    amount: opts.amount,
    getDoc: ({ parent }) => {
      const username = getUsername(parent, opts.username);
      const deviceId = `${username}-${defaultUUID}`;
      // If deviceId is not provided, we want to use different device ids for each user,
      // but the same device id for all the telemetry data of a particular user.
      return getTelemetryDoc(username, opts.deviceId || deviceId);
    }
  };
};

/**
 * Returns designs for creating a new user.
 * @param providedOpts user options:
 *   - `username` - Required if `username` is not set on the parent contact. Setting a `username` on the parent contact
 *      is useful for avoiding username collisions when generating multiple users with the same design (e.g. the
 *      `amount` of the parent contact > 1).
 *   - `roles` - Default: `['chw']`
 *   - `password` - Default: `'password'`
 *   - `telemetryCount` - Default: `10`
 * @returns an array of designs for creating a user
 */
export const getUserDesigns = (providedOpts) => {
  const opts = { roles: ['chw'], password: 'password', telemetryCount: 10, ...providedOpts };
  return [
    {
      amount: 1,
      designId: `_users ${opts.username}`,
      db: '_users',
      getDoc: ({ parent }) => getUserDoc(parent, { username: parent.username, ...opts }),
    },
    {
      amount: 1,
      designId: `user-settings ${opts.username}`,
      db: 'medic',
      getDoc: ({ parent }) => getUserSettingsDoc(parent, { username: parent.username, ...opts }),
    },
    getTelemetryDesign({ ...opts, amount: opts.telemetryCount })
  ];
};

/**
 * Returns designs for creating a new user for an existing contact. (Must manually adjust the contact details.)
 * @param context the design context
 * @returns an array of designs for creating a user for an existing contact
 */
export default context => getUserDesigns({ username: 'chw9' })
  .map(design => ({
    ...design,
    getDoc: (opts) => design.getDoc({
      ...opts,
      parent: {
        _id: '017f0660-72ff-4c2c-9927-4a813293a8c3',
        name: 'Lyle Zboncak',
        parent: { _id: 'f8f1ce44-7330-447e-a2be-176268e5094d' }
      }
    }),
  }));
