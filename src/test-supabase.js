import { supabase } from './lib/supabase'

// Script de diagnóstico para probar la conexión con Supabase
async function testSupabaseConnection() {
  console.log('=== PRUEBA DE CONEXIÓN SUPABASE ===')

  try {
    // 1. Probar obtener sesión
    console.log('\n1. Probando getSession()...')
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('❌ Error en getSession:', sessionError)
    } else {
      console.log('✅ Sesión obtenida:', sessionData.session ? 'Usuario autenticado' : 'Sin sesión')
      if (sessionData.session) {
        console.log('   User ID:', sessionData.session.user.id)
        console.log('   Email:', sessionData.session.user.email)
      }
    }

    // 2. Probar consulta directa a profiles
    console.log('\n2. Probando consulta a profiles (sin filtro)...')
    const { data: allProfiles, error: allError } = await supabase
      .from('profiles')
      .select('*')
      .limit(5)

    if (allError) {
      console.error('❌ Error consultando profiles:', allError)
    } else {
      console.log('✅ Profiles encontrados:', allProfiles.length)
      console.log('   Datos:', allProfiles)
    }

    // 3. Probar consulta con ID específico
    if (sessionData?.session?.user?.id) {
      console.log('\n3. Probando consulta con ID del usuario actual...')
      const userId = sessionData.session.user.id

      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (profileError) {
        console.error('❌ Error consultando perfil del usuario:', profileError)
      } else if (userProfile) {
        console.log('✅ Perfil encontrado:', userProfile)
      } else {
        console.warn('⚠️  No se encontró perfil para el usuario')
      }
    }

    // 4. Verificar políticas RLS
    console.log('\n4. Verificando acceso a tabla profiles...')
    const { error: rpcError } = await supabase.rpc('get_email_by_username', {
      p_username: 'admin_sistema'
    })

    if (rpcError) {
      console.error('❌ Error en RPC:', rpcError)
    } else {
      console.log('✅ RPC funciona correctamente')
    }

  } catch (error) {
    console.error('❌ Error general:', error)
  }

  console.log('\n=== FIN DE PRUEBAS ===')
}

// Ejecutar pruebas
testSupabaseConnection()
