module.exports = {
  'edmx:Edmx': {
    'Version': '4.0',
    'xmlns:edmx': 'http://docs.oasis-open.org/odata/ns/edmx',
    'edmx:DataServices': {
      'Schema': {
        'Namespace': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models',
        'xmlns': 'http://docs.oasis-open.org/odata/ns/edm',
        'EntityType': [{
          'Name': 'Person',
          'Key': {
            'PropertyRef': {
              'Name': 'UserName'
            }
          },
          'Property': [{
            'Name': 'UserName',
            'Type': 'Edm.String',
            'Nullable': 'false'
          }, {
            'Name': 'FirstName',
            'Type': 'Edm.String',
            'Nullable': 'false'
          }, {
            'Name': 'LastName',
            'Type': 'Edm.String'
          }, {
            'Name': 'MiddleName',
            'Type': 'Edm.String'
          }, {
            'Name': 'Gender',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.PersonGender',
            'Nullable': 'false'
          }, {
            'Name': 'Age',
            'Type': 'Edm.Int64'
          }, {
            'Name': 'Emails',
            'Type': 'Collection(Edm.String)'
          }, {
            'Name': 'AddressInfo',
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.Location)'
          }, {
            'Name': 'HomeAddress',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Location'
          }, {
            'Name': 'FavoriteFeature',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Feature',
            'Nullable': 'false'
          }, {
            'Name': 'Features',
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.Feature)',
            'Nullable': 'false'
          }],
          'NavigationProperty': [{
            'Name': 'Friends',
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person)'
          }, {
            'Name': 'BestFriend',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person'
          }, {
            'Name': 'Trips',
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.Trip)'
          }]
        }, {
          'Name': 'Airline',
          'Key': {
            'PropertyRef': {
              'Name': 'AirlineCode'
            }
          },
          'Property': [{
            'Name': 'AirlineCode',
            'Type': 'Edm.String',
            'Nullable': 'false'
          }, {
            'Name': 'Name',
            'Type': 'Edm.String'
          }]
        }, {
          'Name': 'Airport',
          'Key': {
            'PropertyRef': {
              'Name': 'IcaoCode'
            }
          },
          'Property': [{
            'Name': 'Name',
            'Type': 'Edm.String'
          }, {
            'Name': 'IcaoCode',
            'Type': 'Edm.String',
            'Nullable': 'false'
          }, {
            'Name': 'IataCode',
            'Type': 'Edm.String'
          }, {
            'Name': 'Location',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.AirportLocation'
          }]
        }, {
          'Name': 'Trip',
          'Key': {
            'PropertyRef': {
              'Name': 'TripId'
            }
          },
          'Property': [{
            'Name': 'TripId',
            'Type': 'Edm.Int32',
            'Nullable': 'false'
          }, {
            'Name': 'ShareId',
            'Type': 'Edm.Guid',
            'Nullable': 'false'
          }, {
            'Name': 'Name',
            'Type': 'Edm.String'
          }, {
            'Name': 'Budget',
            'Type': 'Edm.Single',
            'Nullable': 'false'
          }, {
            'Name': 'Description',
            'Type': 'Edm.String'
          }, {
            'Name': 'Tags',
            'Type': 'Collection(Edm.String)'
          }, {
            'Name': 'StartsAt',
            'Type': 'Edm.DateTimeOffset',
            'Nullable': 'false'
          }, {
            'Name': 'EndsAt',
            'Type': 'Edm.DateTimeOffset',
            'Nullable': 'false'
          }],
          'NavigationProperty': {
            'Name': 'PlanItems',
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.PlanItem)'
          }
        }, {
          'Name': 'PlanItem',
          'Key': {
            'PropertyRef': {
              'Name': 'PlanItemId'
            }
          },
          'Property': [{
            'Name': 'PlanItemId',
            'Type': 'Edm.Int32',
            'Nullable': 'false'
          }, {
            'Name': 'ConfirmationCode',
            'Type': 'Edm.String'
          }, {
            'Name': 'StartsAt',
            'Type': 'Edm.DateTimeOffset',
            'Nullable': 'false'
          }, {
            'Name': 'EndsAt',
            'Type': 'Edm.DateTimeOffset',
            'Nullable': 'false'
          }, {
            'Name': 'Duration',
            'Type': 'Edm.Duration',
            'Nullable': 'false'
          }]
        }, {
          'Name': 'Event',
          'BaseType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.PlanItem',
          'Property': [{
            'Name': 'OccursAt',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.EventLocation'
          }, {
            'Name': 'Description',
            'Type': 'Edm.String'
          }]
        }, {
          'Name': 'PublicTransportation',
          'BaseType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.PlanItem',
          'Property': {
            'Name': 'SeatNumber',
            'Type': 'Edm.String'
          }
        }, {
          'Name': 'Flight',
          'BaseType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.PublicTransportation',
          'Property': {
            'Name': 'FlightNumber',
            'Type': 'Edm.String'
          },
          'NavigationProperty': [{
            'Name': 'Airline',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Airline'
          }, {
            'Name': 'From',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Airport'
          }, {
            'Name': 'To',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Airport'
          }]
        }, {
          'Name': 'Employee',
          'BaseType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person',
          'Property': {
            'Name': 'Cost',
            'Type': 'Edm.Int64',
            'Nullable': 'false'
          },
          'NavigationProperty': {
            'Name': 'Peers',
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person)'
          }
        }, {
          'Name': 'Manager',
          'BaseType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person',
          'Property': [{
            'Name': 'Budget',
            'Type': 'Edm.Int64',
            'Nullable': 'false'
          }, {
            'Name': 'BossOffice',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Location'
          }],
          'NavigationProperty': {
            'Name': 'DirectReports',
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person)'
          }
        }],
        'ComplexType': [{
          'Name': 'Location',
          'Property': [{
            'Name': 'Address',
            'Type': 'Edm.String'
          }, {
            'Name': 'City',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.City'
          }]
        }, {
          'Name': 'City',
          'Property': [{
            'Name': 'Name',
            'Type': 'Edm.String'
          }, {
            'Name': 'CountryRegion',
            'Type': 'Edm.String'
          }, {
            'Name': 'Region',
            'Type': 'Edm.String'
          }]
        }, {
          'Name': 'AirportLocation',
          'BaseType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Location',
          'Property': {
            'Name': 'Loc',
            'Type': 'Edm.GeographyPoint'
          }
        }, {
          'Name': 'EventLocation',
          'BaseType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Location',
          'Property': {
            'Name': 'BuildingInfo',
            'Type': 'Edm.String'
          }
        }],
        'EnumType': [{
          'Name': 'PersonGender',
          'Member': [{
            'Name': 'Male',
            'Value': '0'
          }, {
            'Name': 'Female',
            'Value': '1'
          }, {
            'Name': 'Unknow',
            'Value': '2'
          }]
        }, {
          'Name': 'Feature',
          'Member': [{
            'Name': 'Feature1',
            'Value': '0'
          }, {
            'Name': 'Feature2',
            'Value': '1'
          }, {
            'Name': 'Feature3',
            'Value': '2'
          }, {
            'Name': 'Feature4',
            'Value': '3'
          }]
        }],
        'Function': [{
          'Name': 'GetPersonWithMostFriends',
          'ReturnType': {
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person'
          }
        }, {
          'Name': 'GetNearestAirport',
          'Parameter': [{
            'Name': 'lat',
            'Type': 'Edm.Double',
            'Nullable': 'false'
          }, {
            'Name': 'lon',
            'Type': 'Edm.Double',
            'Nullable': 'false'
          }],
          'ReturnType': {
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Airport'
          }
        }, {
          'Name': 'GetFavoriteAirline',
          'IsBound': 'true',
          'EntitySetPath': 'person',
          'Parameter': {
            'Name': 'person',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person'
          },
          'ReturnType': {
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Airline'
          }
        }, {
          'Name': 'GetFriendsTrips',
          'IsBound': 'true',
          'Parameter': [{
            'Name': 'person',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person'
          }, {
            'Name': 'userName',
            'Type': 'Edm.String',
            'Nullable': 'false',
            'Unicode': 'false'
          }],
          'ReturnType': {
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.Trip)'
          }
        }, {
          'Name': 'GetInvolvedPeople',
          'IsBound': 'true',
          'Parameter': {
            'Name': 'trip',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Trip'
          },
          'ReturnType': {
            'Type': 'Collection(Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person)'
          }
        }, {
          'Name': 'UpdatePersonLastName',
          'IsBound': 'true',
          'Parameter': [{
            'Name': 'person',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person'
          }, {
            'Name': 'lastName',
            'Type': 'Edm.String',
            'Nullable': 'false',
            'Unicode': 'false'
          }],
          'ReturnType': {
            'Type': 'Edm.Boolean',
            'Nullable': 'false'
          }
        }],
        'Action': [{
          'Name': 'ResetDataSource'
        }, {
          'Name': 'ShareTrip',
          'IsBound': 'true',
          'Parameter': [{
            'Name': 'personInstance',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person'
          }, {
            'Name': 'userName',
            'Type': 'Edm.String',
            'Nullable': 'false',
            'Unicode': 'false'
          }, {
            'Name': 'tripId',
            'Type': 'Edm.Int32',
            'Nullable': 'false'
          }]
        }],
        'EntityContainer': {
          'Name': 'Container',
          'EntitySet': [{
            'Name': 'People',
            'EntityType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person',
            'NavigationPropertyBinding': [{
              'Path': 'Friends',
              'Target': 'People'
            }, {
              'Path': 'BestFriend',
              'Target': 'People'
            }, {
              'Path': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Employee/Peers',
              'Target': 'People'
            }, {
              'Path': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Manager/DirectReports',
              'Target': 'People'
            }]
          }, {
            'Name': 'Airlines',
            'EntityType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Airline',
            'Annotation': {
              'Term': 'Org.OData.Core.V1.OptimisticConcurrency',
              'Collection': {
                'PropertyPath': 'Name'
              }
            }
          }, {
            'Name': 'Airports',
            'EntityType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Airport'
          }, {
            'Name': 'NewComePeople',
            'EntityType': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person'
          }],
          'Singleton': {
            'Name': 'Me',
            'Type': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.Person'
          },
          'FunctionImport': [{
            'Name': 'GetPersonWithMostFriends',
            'Function': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.GetPersonWithMostFriends',
            'EntitySet': 'People'
          }, {
            'Name': 'GetNearestAirport',
            'Function': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.GetNearestAirport',
            'EntitySet': 'Airports'
          }],
          'ActionImport': {
            'Name': 'ResetDataSource',
            'Action': 'Microsoft.OData.Service.Sample.TrippinInMemory.Models.ResetDataSource'
          }
        }
      }
    }
  }
}
