import { render, screen } from '@testing-library/react-native'
import HomeScreen from '../../app/index'

describe('HomeScreen', () => {
  it('renders the home screen correctly', () => {
    render(<HomeScreen />)

    expect(screen.getByText('Pocket Stylist AI')).toBeTruthy()
    expect(screen.getByText('Your intelligent fashion companion')).toBeTruthy()
    expect(screen.getByText('Get Started')).toBeTruthy()
  })
})
