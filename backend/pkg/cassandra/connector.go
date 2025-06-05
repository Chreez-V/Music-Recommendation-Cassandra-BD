package cassandra

import "github.com/gocql/gocql"

var session *gocql.Session

func Init() *gocql.Session {
    cluster := gocql.NewCluster("localhost")
    cluster.Keyspace = "music_recommendation"
    cluster.Consistency = gocql.Quorum
    
    var err error
    session, err = cluster.CreateSession()
    if err != nil {
        panic(err)
    }
    
    return session
}

func GetSession() *gocql.Session {
    return session
}

func Close() {
    if session != nil {
        session.Close()
    }
}
