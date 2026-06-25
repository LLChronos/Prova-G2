import { useEffect, useState } from 'react'
import './App.css'

const initialPosts = [
  {
    id: 1,
    author: 'Maya',
    content: 'Olá, mundo! Esta é a nossa primeira experiência de rede social.',
    likes: 3,
    createdAt: 'há 10 min',
  },
  {
    id: 2,
    author: 'Lucas',
    content: 'A criatividade fica mais forte quando a interface também conta uma história.',
    likes: 5,
    createdAt: 'há 25 min',
  },
]

const initialUsers = [
  {
    id: 1,
    name: 'Maya',
    email: 'maya@rede.com',
    password: '123456',
  },
]

const getStoredValue = (key, fallback) => {
  if (typeof window === 'undefined') return fallback

  const storedValue = window.localStorage.getItem(key)
  if (!storedValue) return fallback

  try {
    return JSON.parse(storedValue)
  } catch {
    return fallback
  }
}

const saveStoredValue = (key, value) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
}

function App() {
  const [theme, setTheme] = useState(() => getStoredValue('social-theme', 'dark'))
  const [users, setUsers] = useState(() => getStoredValue('social-users', initialUsers))
  const [currentUser, setCurrentUser] = useState(() => getStoredValue('social-current-user', null))
  const [posts, setPosts] = useState(() => getStoredValue('social-posts', initialPosts))
  const [favorites, setFavorites] = useState(() => getStoredValue('social-favorites', []))
  const [authMode, setAuthMode] = useState('login')
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' })
  const [postText, setPostText] = useState('')
  const [feedback, setFeedback] = useState('Bem-vindo(a) à rede social!')

  useEffect(() => {
    saveStoredValue('social-theme', theme)
  }, [theme])

  useEffect(() => {
    saveStoredValue('social-users', users)
  }, [users])

  useEffect(() => {
    saveStoredValue('social-current-user', currentUser)
  }, [currentUser])

  useEffect(() => {
    saveStoredValue('social-posts', posts)
  }, [posts])

  useEffect(() => {
    saveStoredValue('social-favorites', favorites)
  }, [favorites])

  const handleAuthSubmit = (event) => {
    event.preventDefault()

    if (authMode === 'login') {
      const foundUser = users.find(
        (user) => user.email === authForm.email && user.password === authForm.password,
      )

      if (foundUser) {
        setCurrentUser(foundUser)
        setFeedback(`Bem-vindo(a), ${foundUser.name}!`)
        setAuthForm({ name: '', email: '', password: '' })
        return
      }

      setFeedback('E-mail ou senha inválidos. Tente novamente.')
      return
    }

    if (!authForm.name || !authForm.email || !authForm.password) {
      setFeedback('Preencha todos os campos para criar a conta.')
      return
    }

    const userExists = users.some((user) => user.email === authForm.email)
    if (userExists) {
      setFeedback('Este e-mail já está cadastrado.')
      return
    }

    const newUser = {
      id: Date.now(),
      name: authForm.name,
      email: authForm.email,
      password: authForm.password,
    }

    setUsers((prevUsers) => [...prevUsers, newUser])
    setCurrentUser(newUser)
    setFeedback(`Conta criada com sucesso, ${newUser.name}!`)
    setAuthForm({ name: '', email: '', password: '' })
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setFeedback('Você saiu da sessão. Volte sempre!')
  }

  const handlePublish = (event) => {
    event.preventDefault()

    if (!currentUser) {
      setFeedback('Faça login para publicar.')
      return
    }

    const content = postText.trim()
    if (!content) {
      setFeedback('Escreva algo antes de publicar.')
      return
    }

    const newPost = {
      id: Date.now(),
      author: currentUser.name,
      content,
      likes: 0,
      createdAt: 'agora',
    }

    setPosts((prevPosts) => [newPost, ...prevPosts])
    setPostText('')
    setFeedback('Post publicado com sucesso!')
  }

  const handleToggleFavorite = (postId) => {
    if (!currentUser) {
      setFeedback('Entre na conta para curtir posts.')
      return
    }

    setFavorites((prevFavorites) =>
      prevFavorites.includes(postId)
        ? prevFavorites.filter((favoriteId) => favoriteId !== postId)
        : [...prevFavorites, postId],
    )
  }

  return (
    <div className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <main className="app-main">
        <section className="hero-card">
          <div>
            <p className="eyebrow">Rede social • frontend pronto para integração</p>
            <h1>Conecte-se, publique e inspire.</h1>
            <p className="hero-copy">
              Uma experiência simples, acolhedora e com personalidade para a sua prova.
            </p>
          </div>

          <button
            className="theme-toggle"
            onClick={() => setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'))}
            type="button"
          >
            {theme === 'dark' ? '☀️ Tema claro' : '🌙 Tema escuro'}
          </button>
        </section>

        <section className="content-grid">
          <aside className="side-card">
            <div className="card-header">
              <h2>{currentUser ? `Olá, ${currentUser.name}` : 'Entre na sua conta'}</h2>
              <p>{feedback}</p>
            </div>

            {!currentUser ? (
              <>
                <div className="switcher">
                  <button
                    className={authMode === 'login' ? 'active' : ''}
                    onClick={() => {
                      setAuthMode('login')
                      setFeedback('Use seus dados para entrar.')
                    }}
                    type="button"
                  >
                    Entrar
                  </button>
                  <button
                    className={authMode === 'register' ? 'active' : ''}
                    onClick={() => {
                      setAuthMode('register')
                      setFeedback('Crie uma conta para começar a postar.')
                    }}
                    type="button"
                  >
                    Criar conta
                  </button>
                </div>

                <form className="auth-form" onSubmit={handleAuthSubmit}>
                  {authMode === 'register' && (
                    <input
                      placeholder="Seu nome"
                      value={authForm.name}
                      onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })}
                    />
                  )}

                  <input
                    type="email"
                    placeholder="E-mail"
                    value={authForm.email}
                    onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })}
                  />

                  <input
                    type="password"
                    placeholder="Senha"
                    value={authForm.password}
                    onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })}
                  />

                  <button type="submit">
                    {authMode === 'login' ? 'Entrar' : 'Criar conta'}
                  </button>
                </form>
              </>
            ) : (
              <div className="profile-card">
                <p>Você está online e pode publicar agora.</p>
                <button className="ghost-btn" onClick={handleLogout} type="button">
                  Sair
                </button>
              </div>
            )}
          </aside>

          <section className="feed-card">
            <div className="card-header">
              <h2>Página inicial</h2>
              <p>Veja os posts mais recentes e participe da conversa.</p>
            </div>

            {currentUser ? (
              <form className="composer" onSubmit={handlePublish}>
                <textarea
                  placeholder={`O que você quer compartilhar, ${currentUser.name}?`}
                  value={postText}
                  onChange={(event) => setPostText(event.target.value)}
                />
                <button type="submit">Publicar</button>
              </form>
            ) : (
              <div className="guest-note">Faça login para publicar e curtir mensagens.</div>
            )}

            <div className="posts-list">
              {posts.map((post) => {
                const isFavorite = favorites.includes(post.id)

                return (
                  <article className="post-card" key={post.id}>
                    <div className="post-head">
                      <div>
                        <strong>{post.author}</strong>
                        <span>{post.createdAt}</span>
                      </div>
                      <button
                        className={`like-btn ${isFavorite ? 'liked' : ''}`}
                        onClick={() => handleToggleFavorite(post.id)}
                        type="button"
                      >
                        {isFavorite ? '💜' : '🤍'} {post.likes + (isFavorite ? 1 : 0)}
                      </button>
                    </div>
                    <p>{post.content}</p>
                  </article>
                )
              })}
            </div>
          </section>
        </section>
      </main>
    </div>
  )
}

export default App
