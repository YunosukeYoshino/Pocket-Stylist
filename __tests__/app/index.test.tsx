import { render } from '@testing-library/react-native'
import HomeScreen from '../../app/index'

describe('HomeScreen', () => {
  it('renders the home screen correctly', () => {
    const component = render(<HomeScreen />)

    // Check if the component renders without crashing
    expect(component.toJSON()).toBeTruthy()

    // Test that the component contains the expected content
    const jsonOutput = JSON.stringify(component.toJSON())
    expect(jsonOutput).toContain('Pocket Stylist AI')
    expect(jsonOutput).toContain('Your intelligent fashion companion')
    expect(jsonOutput).toContain('Get Started')
  })
})
